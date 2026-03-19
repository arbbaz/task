import { render, screen, waitFor } from "@testing-library/react";
import { useAuth, AuthProvider } from "./AuthContext";

const useSessionMock = vi.fn();
const authMeMock = vi.fn();
const showToastMock = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => useSessionMock(),
}));

vi.mock("@/features/auth/api/client", () => ({
  authApi: {
    me: () => authMeMock(),
  },
}));

vi.mock("@/lib/contexts/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
  }),
}));

function Probe() {
  const { isLoggedIn, user, isAuthLoading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isAuthLoading)}</span>
      <span data-testid="logged-in">{String(isLoggedIn)}</span>
      <span data-testid="username">{user?.username ?? "none"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to backend auth when NextAuth is unauthenticated", async () => {
    useSessionMock.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });
    authMeMock.mockResolvedValue({
      data: {
        user: {
          id: "1",
          username: "arbaz",
          email: "arbaz@example.com",
        },
      },
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(authMeMock).toHaveBeenCalled();
      expect(screen.getByTestId("logged-in")).toHaveTextContent("true");
    });

    expect(screen.getByTestId("username")).toHaveTextContent("arbaz");
    expect(showToastMock).not.toHaveBeenCalled();
  });
});
