import { createContext, useContext, useEffect, useState } from "react";
import { authClient, type User, type Session } from "./auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: typeof authClient.signIn.email;
  signOut: typeof authClient.signOut;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await authClient.getSession();
      if (data.data) {
        setUser(data.data.user);
        setSession(data.data.session);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error("Failed to get session:", error);
      setUser(null);
      setSession(null);
    }
  };

  useEffect(() => {
    // Get initial session
    refresh().finally(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn: authClient.signIn.email,
        signOut: authClient.signOut,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
