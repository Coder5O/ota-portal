import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { onAuthStateSubscription } from "@/lib/firebase";
import { currentUrl } from "@/lib/authReturnTo";

/**
 * The visitor, resolved once per page load and cached in the router's QueryClient:
 * the login gate (src/components/auth/AuthGate.jsx) reads it with
 * `context.queryClient.ensureQueryData(authQuery)`, components with `useAuth()`.
 * Resolves to `{ user, error }`: an anonymous visitor is `{ user: null, error: null }`.
 */
export const authQuery = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: async () => {
    if (typeof window === "undefined") return { user: null, error: null };
    try {
      await base44.auth.authStateReady();
      if (!base44.auth.hasToken()) return { user: null, error: null };
      const user = await base44.auth.me();
      return { user, error: null };
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) return { user: null, error: null };
      return { user: null, error: { type: "unknown", message: err.message ?? "Failed to load session" } };
    }
  },
  staleTime: Infinity,
  retry: false,
});

const AuthContext = createContext(null);

/**
 * Client-side session state backed by Firebase Authentication.
 */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { data, error, isPending } = useQuery(authQuery);

  // Synchronize Firebase auth state changes in real-time
  useEffect(() => {
    const unsubscribe = onAuthStateSubscription((profile) => {
      queryClient.setQueryData(authQuery.queryKey, { user: profile, error: null });
    });
    return () => unsubscribe();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user: data?.user ?? null,
      isAuthenticated: !!data?.user,
      isLoadingAuth: isPending,
      authError: data?.error ?? (error ? { type: "unknown", message: error.message ?? "Failed to load session" } : null),
      refresh: () => queryClient.fetchQuery({ ...authQuery, staleTime: 0 }),
      logout: async () => {
        queryClient.setQueryData(authQuery.queryKey, { user: null, error: null });
        await base44.auth.logout(window.location.origin);
      },
      navigateToLogin: () => base44.auth.redirectToLogin(currentUrl()),
    }),
    [data, error, isPending, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
