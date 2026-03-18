declare module "@supabase/supabase-js" {
  export type User = {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  };

  export type Session = {
    user: User;
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    [key: string]: unknown;
  };

  interface SupabaseAuthClient {
    signOut: () => Promise<{ error: { message: string } | null }>;
    onAuthStateChange: (
      callback: (event: string, session: Session | null) => void | Promise<void>,
    ) => { data: { subscription: { unsubscribe: () => void } } };
    getSession: () => Promise<{ data: { session: Session | null } }>;
    signUp: (credentials: unknown) => Promise<{ data?: unknown; error: { message: string } | null }>;
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
      data: { user: User | null; session: Session | null };
      error: { message: string } | null;
    }>;
    resetPasswordForEmail: (
      email: string,
      options?: unknown,
    ) => Promise<{ data?: unknown; error: { message: string } | null }>;
    updateUser: (attributes: unknown) => Promise<{ data?: unknown; error: { message: string } | null }>;
    setSession: (tokens: unknown) => Promise<{ data?: unknown; error?: { message: string } | null }>;
  }
}
