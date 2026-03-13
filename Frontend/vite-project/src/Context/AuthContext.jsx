import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(apiUrl("/api/auth/me"), {
        withCredentials: true,
      });
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    // Best-effort session reset so role switching works without manual logout.
    try {
      await axios.post(
        apiUrl("/api/auth/logout"),
        {},
        { withCredentials: true },
      );
    } catch (error) {
      // Ignore logout failures and continue with fresh login attempt.
    }

    setUser(null);

    // Check if identifier is email or phone
    const isEmail = identifier.includes("@");
    const payload = isEmail
      ? { email: identifier, password }
      : { phone: identifier, password };

    const response = await axios.post(apiUrl("/api/auth/login"), payload, {
      withCredentials: true,
    });
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = async () => {
    await axios.post(apiUrl("/api/auth/logout"), {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
