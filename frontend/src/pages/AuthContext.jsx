import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [role,setrole]=useState(null)

  
  useEffect(() => {
    const checkAuth = async () => {
      try {
      
        const res = await fetch("http://localhost:8000/verify/auth", {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 200) {
          const data = await res.json();
          console.log(" Auth confirmed:", data);
          setrole(data.role);
          setIsAuthenticated(true);
        } else {
          console.log(" Not authenticated");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error(" Error checking auth:", err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    // Optionally call backend logout route
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated,setUser, user,role, setIsAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
