import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
}));

// Mock environment variables for tests
process.env.NEXTAUTH_SECRET = "test-secret-for-testing";
process.env.NEXTAUTH_URL = "http://localhost:3000";

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
