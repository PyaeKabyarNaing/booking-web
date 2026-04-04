export type UserRole = "customer" | "admin";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Staff {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StaffService {
  staff_id: string;
  service_id: string;
}

export interface StaffSchedule {
  id: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Booking {
  id: string;
  customer_id: string;
  staff_id: string;
  service_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
}

export interface BookingWithDetails extends Booking {
  service: Service;
  staff: Staff;
  customer: Profile;
}

export interface StaffWithServices extends Staff {
  staff_services: { service_id: string }[];
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: Partial<Profile>;
        Relationships: [];
      };
      services: {
        Row: Service;
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Service>;
        Relationships: [];
      };
      staff: {
        Row: Staff;
        Insert: {
          id?: string;
          name: string;
          bio?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Staff>;
        Relationships: [];
      };
      staff_services: {
        Row: StaffService;
        Insert: StaffService;
        Update: Partial<StaffService>;
        Relationships: [];
      };
      staff_schedules: {
        Row: StaffSchedule;
        Insert: {
          id?: string;
          staff_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available?: boolean;
        };
        Update: Partial<StaffSchedule>;
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: {
          id?: string;
          customer_id: string;
          staff_id: string;
          service_id: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status?: BookingStatus;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Booking>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      booking_status: BookingStatus;
    };
  };
}
