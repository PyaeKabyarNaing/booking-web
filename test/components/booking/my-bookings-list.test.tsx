import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MyBookingsList,
  type CustomerBookingRow,
} from "@/components/booking/my-bookings-list";
import { vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const makeBooking = (
  overrides: Partial<CustomerBookingRow> = {}
): CustomerBookingRow => ({
  id: "b-1",
  booking_date: "2025-06-15",
  start_time: "10:00:00",
  end_time: "11:00:00",
  status: "confirmed",
  service: {
    id: "svc-1",
    name: "Haircut",
    description: null,
    duration_minutes: 60,
    price: 30,
    image_url: null,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  staff: {
    id: "staff-1",
    name: "Jane Doe",
    bio: null,
    avatar_url: null,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  ...overrides,
});

describe("MyBookingsList", () => {
  it("shows empty state when no bookings", () => {
    render(<MyBookingsList bookings={[]} />);
    expect(screen.getByText("No appointments yet")).toBeInTheDocument();
    expect(
      screen.getByText("Book an appointment").closest("a")
    ).toHaveAttribute("href", "/booking");
  });

  it("renders a booking with correct details", () => {
    render(<MyBookingsList bookings={[makeBooking()]} />);

    expect(screen.getByText("Haircut")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("10:00 – 11:00")).toBeInTheDocument();
  });

  it("renders multiple bookings", () => {
    const bookings = [
      makeBooking({ id: "b-1", status: "confirmed" }),
      makeBooking({
        id: "b-2",
        status: "pending",
        service: {
          id: "svc-2",
          name: "Beard Trim",
          description: null,
          duration_minutes: 30,
          price: 15,
          image_url: null,
          is_active: true,
          created_at: "2025-01-01T00:00:00Z",
        },
      }),
    ];

    render(<MyBookingsList bookings={bookings} />);
    expect(screen.getByText("Haircut")).toBeInTheDocument();
    expect(screen.getByText("Beard Trim")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders all status badge variants", () => {
    const statuses = ["pending", "confirmed", "cancelled", "completed"] as const;

    statuses.forEach((status) => {
      const { unmount } = render(
        <MyBookingsList bookings={[makeBooking({ id: `b-${status}`, status })]} />
      );
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it("shows fallback text when service or staff is null", () => {
    const booking = makeBooking({ service: null, staff: null });
    render(<MyBookingsList bookings={[booking]} />);

    const serviceValues = screen.getAllByText("Service");
    expect(serviceValues).toHaveLength(2);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("links to the booking confirmation page", () => {
    render(<MyBookingsList bookings={[makeBooking({ id: "b-123" })]} />);
    const link = screen.getByText("View details").closest("a");
    expect(link).toHaveAttribute("href", "/booking/confirmation/b-123");
  });
});
