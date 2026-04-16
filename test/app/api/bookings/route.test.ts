import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ single: mockSingle }));
const mockInsert = vi.fn(() => ({ select: mockSelect }));
const mockIn = vi.fn(() => ({ lt: vi.fn(() => ({ gt: vi.fn(() => ({ data: [] })) })) }));
const mockEq = vi.fn();

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

// Import after mocks are set up
const { POST } = await import("@/app/api/bookings/route");

const validBody = {
  service_id: "550e8400-e29b-41d4-a716-446655440000",
  staff_id: "550e8400-e29b-41d4-a716-446655440001",
  booking_date: "2025-06-15",
  start_time: "10:00",
  end_time: "11:00",
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/bookings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("returns 400 for invalid booking data", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const res = await POST(makeRequest({ service_id: "not-a-uuid" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid booking data");
  });

  it("returns 400 for missing required fields", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid booking data");
  });

  it("returns 404 when service is not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === "services") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ single: () => ({ data: null }) }) }) }),
        };
      }
      return {};
    });

    const res = await POST(makeRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("Service not found or inactive");
  });

  it("returns 404 when staff is not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === "services") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ single: () => ({ data: { id: validBody.service_id } }) }) }) }),
        };
      }
      if (table === "staff") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ single: () => ({ data: null }) }) }) }),
        };
      }
      return {};
    });

    const res = await POST(makeRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("Staff member not found or inactive");
  });

  it("returns 409 when time slot conflicts exist", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === "services") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ single: () => ({ data: { id: validBody.service_id } }) }) }) }),
        };
      }
      if (table === "staff") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ single: () => ({ data: { id: validBody.staff_id } }) }) }) }),
        };
      }
      if (table === "bookings") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                in: () => ({
                  lt: () => ({
                    gt: () => ({ data: [{ id: "conflict-1" }] }),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(makeRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("This time slot is no longer available");
  });

  it("returns 201 with booking on success", async () => {
    const createdBooking = { id: "new-booking-1", ...validBody };
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === "services") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ single: () => ({ data: { id: validBody.service_id } }) }) }) }),
        };
      }
      if (table === "staff") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ single: () => ({ data: { id: validBody.staff_id } }) }) }) }),
        };
      }
      if (table === "bookings") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                in: () => ({
                  lt: () => ({
                    gt: () => ({ data: [] }),
                  }),
                }),
              }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: () => ({ data: createdBooking, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(makeRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.booking).toEqual(createdBooking);
  });
});
