import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "client" | "lawyer" | "admin";
type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};
type AuthSession = {
  user: AuthUser | null;
} | null;

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: "client" | "lawyer") => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ROLE_PRIORITY: AppRole[] = ["admin", "lawyer", "client"];

const pickRole = (roles: AppRole[]): AppRole | null => {
  const prioritized = ROLE_PRIORITY.find((r) => roles.includes(r));
  return prioritized ?? roles[0] ?? null;
};

const parseRoleFromMetadata = (metadataRole: unknown): AppRole | null => {
  if (metadataRole === "client" || metadataRole === "lawyer" || metadataRole === "admin") {
    return metadataRole;
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = supabase.auth as any;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (userId: string): Promise<AppRole | null> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .abortSignal(controller.signal);

      clearTimeout(timeout);

      if (error) {
        console.error("Role fetch failed:", error.message);
        return null;
      }

      const roles = (data ?? []).map((item) => item.role as AppRole);
      return pickRole(roles);
    } catch (err) {
      console.error("Role fetch error:", err);
      return null;
    }
  }, []);

  const hydrateAuthState = useCallback(async (nextSession: AuthSession) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (!nextSession?.user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const dbRole = await fetchRole(nextSession.user.id);
    const metadataRole = parseRoleFromMetadata(nextSession.user.user_metadata?.role);
    const resolvedRole = dbRole ?? metadataRole;

    if (!resolvedRole) {
      console.warn("Authenticated user has no role mapping.", { userId: nextSession.user.id });
    }

    setRole(resolvedRole);
    setLoading(false);
  }, [fetchRole]);

  // Session timeout via activity tracking
  useEffect(() => {
    if (!session) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        auth.signOut();
      }, SESSION_TIMEOUT_MS);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [session, auth]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = auth.onAuthStateChange(
      async (_event: string, nextSession: AuthSession) => {
        await hydrateAuthState(nextSession);
      }
    );

    // THEN get initial session
    auth.getSession().then(async ({ data: { session: initialSession } }: { data: { session: AuthSession } }) => {
      await hydrateAuthState(initialSession);
    });

    // Safety timeout: never stay in loading state forever
    const safetyTimeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("Auth loading safety timeout triggered");
        }
        return false;
      });
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [hydrateAuthState, auth]);

  const signUp = async (email: string, password: string, fullName: string, role: "client" | "lawyer") => {
    const { error } = await auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await auth.signInWithPassword({ email: normalizedEmail, password });

    if (error) {
      console.error("Login error:", error.message);
      return { error: new Error(error.message) };
    }

    if (data?.user) {
      setUser(data.user as AuthUser);
      setSession((data.session ?? null) as AuthSession);

      const dbRole = await fetchRole(data.user.id);
      const metadataRole = parseRoleFromMetadata((data.user.user_metadata as Record<string, unknown> | undefined)?.role);
      setRole(dbRole ?? metadataRole);

      console.info("Login successful", { userId: data.user.id, email: data.user.email });

      // Update last_login in background — don't block the login flow
      supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("user_id", data.user.id)
        .then(({ error: lastLoginError }) => {
          if (lastLoginError) {
            console.error("last_login update failed:", lastLoginError.message);
          }
        });
    }

    return { error: null };
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await auth.updateUser({ password });
    return { error: error ? new Error(error.message) : null };
  };

  return (
    <AuthContext.Provider
      value={{ user, session, role, loading, signUp, signIn, signOut, resetPassword, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
