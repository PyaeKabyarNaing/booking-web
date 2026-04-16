import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingFlow } from "@/components/booking/booking-flow";
import type { Service, StaffWithServices } from "@/lib/types/database";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    loading: false,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("@/components/booking/booking-stepper", () => ({
  BookingStepper: ({ currentStep }: { currentStep: number }) => (
    <div data-testid="stepper">Step {currentStep}</div>
  ),
}));

vi.mock("@/components/booking/service-select", () => ({
  ServiceSelect: ({
    onSelect,
    services,
  }: {
    onSelect: (s: Service) => void;
    services: Service[];
  }) => (
    <div data-testid="service-select">
      {services.map((s) => (
        <button key={s.id} onClick={() => onSelect(s)}>
          {s.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/components/booking/staff-select", () => ({
  StaffSelect: ({
    onSelect,
    staff,
  }: {
    onSelect: (s: StaffWithServices) => void;
    staff: StaffWithServices[];
  }) => (
    <div data-testid="staff-select">
      {staff.map((s) => (
        <button key={s.id} onClick={() => onSelect(s)}>
          {s.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/components/booking/datetime-select", () => ({
  DateTimeSelect: ({
    onSelect,
  }: {
    onSelect: (date: string, slot: { start: string; end: string; available: boolean }) => void;
  }) => (
    <div data-testid="datetime-select">
      <button onClick={() => onSelect("2025-06-15", { start: "10:00", end: "11:00", available: true })}>
        Pick Time
      </button>
    </div>
  ),
}));

vi.mock("@/components/booking/booking-summary", () => ({
  BookingSummary: ({
    onConfirm,
    onBack,
    loading,
  }: {
    onConfirm: () => void;
    onBack: () => void;
    loading: boolean;
  }) => (
    <div data-testid="booking-summary">
      <button onClick={onConfirm} disabled={loading}>
        Confirm
      </button>
      <button onClick={onBack}>Back to DateTime</button>
    </div>
  ),
}));

const services: Service[] = [
  {
    id: "svc-1",
    name: "Haircut",
    description: null,
    duration_minutes: 60,
    price: 30,
    image_url: null,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
];

const staffList: StaffWithServices[] = [
  {
    id: "staff-1",
    name: "Jane",
    bio: null,
    avatar_url: null,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    staff_services: [{ service_id: "svc-1" }],
  },
];

describe("BookingFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders at step 0 with service select", () => {
    render(<BookingFlow services={services} staff={staffList} />);
    expect(screen.getByTestId("stepper")).toHaveTextContent("Step 0");
    expect(screen.getByTestId("service-select")).toBeInTheDocument();
  });

  it("disables Continue when nothing is selected", () => {
    render(<BookingFlow services={services} staff={staffList} />);
    expect(screen.getByText("Continue")).toBeDisabled();
  });

  it("enables Continue after selecting a service", async () => {
    render(<BookingFlow services={services} staff={staffList} />);
    await userEvent.click(screen.getByText("Haircut"));
    expect(screen.getByText("Continue")).toBeEnabled();
  });

  it("navigates through all steps", async () => {
    render(<BookingFlow services={services} staff={staffList} />);

    // Step 0: select service
    await userEvent.click(screen.getByText("Haircut"));
    await userEvent.click(screen.getByText("Continue"));
    expect(screen.getByTestId("stepper")).toHaveTextContent("Step 1");

    // Step 1: select staff
    await userEvent.click(screen.getByText("Jane"));
    await userEvent.click(screen.getByText("Continue"));
    expect(screen.getByTestId("stepper")).toHaveTextContent("Step 2");

    // Step 2: select date/time
    await userEvent.click(screen.getByText("Pick Time"));
    await userEvent.click(screen.getByText("Continue"));
    expect(screen.getByTestId("stepper")).toHaveTextContent("Step 3");

    // Step 3: summary is shown
    expect(screen.getByTestId("booking-summary")).toBeInTheDocument();
  });

  it("goes back from step 1 to step 0", async () => {
    render(<BookingFlow services={services} staff={staffList} />);

    await userEvent.click(screen.getByText("Haircut"));
    await userEvent.click(screen.getByText("Continue"));
    expect(screen.getByTestId("stepper")).toHaveTextContent("Step 1");

    await userEvent.click(screen.getByText("Back"));
    expect(screen.getByTestId("stepper")).toHaveTextContent("Step 0");
  });

  it("disables the Back button on step 0", () => {
    render(<BookingFlow services={services} staff={staffList} />);
    expect(screen.getByText("Back")).toBeDisabled();
  });

  it("restores state from localStorage on mount", () => {
    const pendingBooking = {
      service: services[0],
      staff: staffList[0],
      date: "2025-06-15",
      timeSlot: { start: "10:00", end: "11:00", available: true },
      step: 3,
    };
    localStorage.setItem("pending_booking", JSON.stringify(pendingBooking));

    render(<BookingFlow services={services} staff={staffList} />);
    expect(screen.getByTestId("booking-summary")).toBeInTheDocument();
  });

  it("clears localStorage after restoring pending booking", () => {
    const pendingBooking = {
      service: services[0],
      staff: staffList[0],
      date: "2025-06-15",
      timeSlot: { start: "10:00", end: "11:00", available: true },
      step: 3,
    };
    localStorage.setItem("pending_booking", JSON.stringify(pendingBooking));

    render(<BookingFlow services={services} staff={staffList} />);
    expect(localStorage.getItem("pending_booking")).toBeNull();
  });

  it("submits booking and redirects on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ booking: { id: "new-booking-1" } }),
    });

    render(<BookingFlow services={services} staff={staffList} />);

    // Navigate to summary
    await userEvent.click(screen.getByText("Haircut"));
    await userEvent.click(screen.getByText("Continue"));
    await userEvent.click(screen.getByText("Jane"));
    await userEvent.click(screen.getByText("Continue"));
    await userEvent.click(screen.getByText("Pick Time"));
    await userEvent.click(screen.getByText("Continue"));

    // Confirm
    await userEvent.click(screen.getByText("Confirm"));

    expect(global.fetch).toHaveBeenCalledWith("/api/bookings", expect.objectContaining({ method: "POST" }));
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/booking/confirmation/new-booking-1");
    });
  });

  it("shows error message on failed booking", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Slot taken" }),
    });

    render(<BookingFlow services={services} staff={staffList} />);

    await userEvent.click(screen.getByText("Haircut"));
    await userEvent.click(screen.getByText("Continue"));
    await userEvent.click(screen.getByText("Jane"));
    await userEvent.click(screen.getByText("Continue"));
    await userEvent.click(screen.getByText("Pick Time"));
    await userEvent.click(screen.getByText("Continue"));

    await userEvent.click(screen.getByText("Confirm"));

    await vi.waitFor(() => {
      expect(screen.getByText("Slot taken")).toBeInTheDocument();
    });
  });
});
