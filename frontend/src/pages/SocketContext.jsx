// SocketContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, role } = useAuth(); 
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const socketRef = useRef(null);

  

  const connectSocket = async () => {
    try {
      if (!role) {
        return;
      }

      // Disconnect previous socket if any
      if (socketRef.current) {
        console.log(" Disconnecting previous socket...");
        socketRef.current.disconnect();
      }

      console.log(` Creating new socket connection for role: ${role} ...`);
      const newSocket = io("http://localhost:8000", {
        withCredentials: true,
        query: { role },
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected successfully!");
        console.log("New socket ID:", newSocket.id);
        setSocketId(newSocket.id);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected from server");
        setSocketId(null);
      });

    } catch (err) {
      console.error("Socket connection failed:", err);
    }
  };

  
  useEffect(() => {
    if (isAuthenticated && role) {
      setTimeout(connectSocket, 300); // small delay for session stabilization
    } else {
      console.log("Logged out or missing role -> disconnecting socket...");
      if (socketRef.current) socketRef.current.disconnect();
      setSocket(null);
      setSocketId(null);
    }
  }, [isAuthenticated, role]);

 
  useEffect(() => {
    if (isAuthenticated && role) {
      connectSocket();
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, socketId, role }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
