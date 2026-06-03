import { createContext, useContext, useEffect, useState } from "react";
import { adminLogin, adminLogout, verifyAdminSession } from "@admin/services/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    verifyAdminSession()
      .then(() => {
        if (isMounted) {
          setUser({ id: "admin", name: "Admin TK", role: "admin" });
        }
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    await adminLogin({ email, password });
    const mockUser = { id: "admin", name: "Admin TK", email, role: "admin" };
    setUser(mockUser);
    return mockUser;
  };

  const logout = async () => {
    try {
      await adminLogout();
    } catch {
      // Local logout should still clear the admin session if the API is unavailable.
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
