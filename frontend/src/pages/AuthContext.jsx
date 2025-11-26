import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userID, setUserID] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); 
  const API = import.meta.env.VITE_API_URL;  

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API}/verify/auth`, {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 200) {
          const data = await res.json();
          console.log("Auth confirmed:", data);

          setRole(data.role);
          setUserID(data.id);
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          console.log("Not authenticated");
          setIsAuthenticated(false);
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);       // ✅ ALWAYS STOP LOADING
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userID,
        role,
        setUser,
        setUserID,
        setIsAuthenticated,
        logout,
        loading,     
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
