import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingSummary } from "@/components/booking/booking-summary";
import type { Service, StaffWithServices } from "@/lib/types/database";
import type { TimeSlot } from "@/lib/utils/time-slots";

const mockSignInWithGoogle = vi.fn();

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signInWithGoogle: mockSignInWithGoogle,
    signOut: vi.fn(),
  })),
}));

import { useAuth } from "@/components/auth/auth-provider";
const mockedUseAuth = vi.mocked(useAuth);

const service: Service = {
  id: "svc-1",
  name: "Classic Haircut",
  description: "A classic men's haircut",
  duration_minutes: 45,
  price: 35,
  image_url: null,
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
};

const staff: StaffWithServices = {
  id: "staff-1",
  name: "Alex Turner",
  bio: null,
  avatar_url: null,
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
  staff_services: [{ service_id: "svc-1" }],
};

const timeSlot: TimeSlot = {
  start: "10:00",
  end: "10:45",
  available: true,
};

const defaultProps = {
  service,
  staff,
  date: "2025-06-15",
  timeSlot,
  loading: false,
  onConfirm: vi.fn(),
  onBack: vi.fn(),
};

describe("BookingSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders all booking details", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-1" } as any,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: vi.fn(),
    });

    render(<BookingSummary {...defaultProps} />);

    expect(screen.getByText("Classic Haircut")).toBeInTheDocument();
    expect(screen.getByText("Alex Turner")).toBeInTheDocument();
    expect(screen.getByText("$35")).toBeInTheDocument();
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
    expect(screen.getByText(/10:45/)).toBeInTheDocument();
    expect(screen.getByText(/45 min/)).toBeInTheDocument();
  });

  it("formats the date correctly", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-1" } as any,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: vi.fn(),
    });

    render(<BookingSummary {...defaultProps} />);
    expect(screen.getByText(/June 15, 2025/)).toBeInTheDocument();
  });

  it("shows 'Confirm Booking' when user is logged in", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-1" } as any,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: vi.fn(),
    });

    render(<BookingSummary {...defaultProps} />);
    expect(screen.getByText("Confirm Booking")).toBeInTheDocument();
  });

  it("shows 'Sign in to Confirm' when user is not logged in", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: vi.fn(),
    });

    render(<BookingSummary {...defaultProps} />);
    expect(screen.getByText("Sign in to Confirm")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-1" } as any,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: vi.fn(),
    });

    render(<BookingSummary {...defaultProps} />);
    await userEvent.click(screen.getByText("Confirm Booking"));
    expect(defaultProps.onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onBack when go back button is clicked", async () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-1" } as any,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: vi.fn(),
    });

    render(<BookingSummary {...defaultProps} />);
    await userEvent.click(screen.getByText("Go Back"));
    expect(defaultProps.onBack).toHaveBeenCalledOnce();
  });

  it("disables confirm button when loading", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-1" } as any,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: vi.fn(),
    });

    render(<BookingSummary {...defaultProps} loading={true} />);
    expect(screen.getByText("Booking...")).toBeDisabled();
  });

  it.skip("saves to localStorage and calls signInWithGoogle when unauthenticated user clicks sign-in", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: vi.fn(),
    });

    render(<BookingSummary {...defaultProps} />);
    await userEvent.click(screen.getByText("Sign in to Confirm"));

    const stored = JSON.parse(localStorage.getItem("pending_booking")!);
    expect(stored.service.id).toBe("svc-1");
    expect(stored.staff.id).toBe("staff-1");
    expect(stored.step).toBe(3);
    expect(mockSignInWithGoogle).toHaveBeenCalledWith("/booking");
  });
});
