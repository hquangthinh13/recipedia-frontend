import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, email, avatar }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch current user when token changes
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get("http://localhost:5001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar || null,
        });
      } catch (err) {
        console.error("Auth fetch failed:", err?.response?.data || err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (token) => {
    localStorage.setItem("token", token);
    try {
      const { data } = await axios.get("http://localhost:5001/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatar || null,
      });
    } catch (err) {
      console.error("Failed to fetch user on login:", err);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
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
