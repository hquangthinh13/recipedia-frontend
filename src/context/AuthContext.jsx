import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, email, avatar }
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("token")); // reactive
  const navigate = useNavigate();

  // Fetch current user whenever token changes
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar || null, // ✅ consistent everywhere
        });
      } catch (err) {
        console.error("Auth fetch failed:", err?.response?.data || err.message);
        setUser(null);
        localStorage.removeItem("token"); // clear bad token
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  // Save token + fetch user
  const login = async (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken); // triggers useEffect → fetches user
  };

  // Clear auth state
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Easy hook
export const useAuth = () => useContext(AuthContext);
