import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthButton } from "@/components/auth/auth-button";

const mockSignInWithGoogle = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signInWithGoogle: mockSignInWithGoogle,
    signOut: mockSignOut,
  })),
}));

// Stub next/link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { useAuth } from "@/components/auth/auth-provider";
const mockedUseAuth = vi.mocked(useAuth);

describe("AuthButton", () => {
  it("shows a loading skeleton when auth is loading", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: mockSignOut,
    });

    const { container } = render(<AuthButton />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("shows sign-in button when no user is logged in", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: mockSignOut,
    });

    render(<AuthButton />);
    expect(screen.getByText("Sign In With Google")).toBeInTheDocument();
  });

  it("calls signInWithGoogle when sign-in button is clicked", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: mockSignOut,
    });

    render(<AuthButton />);
    await userEvent.click(screen.getByText("Sign In With Google"));
    expect(mockSignInWithGoogle).toHaveBeenCalledOnce();
  });

  it("shows user info, my-bookings link, and sign-out button when logged in", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        user_metadata: { full_name: "John Smith", avatar_url: null },
      } as any,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: mockSignOut,
    });

    render(<AuthButton />);
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("My bookings")).toBeInTheDocument();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  it("shows avatar image when user has avatar_url", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        user_metadata: {
          full_name: "John Smith",
          avatar_url: "https://example.com/avatar.jpg",
        },
      } as any,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: mockSignOut,
    });

    const { container } = render(<AuthButton />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("calls signOut when sign-out button is clicked", async () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        user_metadata: { full_name: "John Smith" },
      } as any,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: mockSignOut,
    });

    render(<AuthButton />);
    await userEvent.click(screen.getByText("Sign Out"));
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it("shows 'Account' when user has no full_name", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        user_metadata: {},
      } as any,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: mockSignOut,
    });

    render(<AuthButton />);
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("links to /booking/my-bookings", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        user_metadata: { full_name: "Jane" },
      } as any,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: mockSignOut,
    });

    render(<AuthButton />);
    const link = screen.getByText("My bookings").closest("a");
    expect(link).toHaveAttribute("href", "/booking/my-bookings");
  });
});
