// SocketContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, role, userID } = useAuth()
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const socketRef = useRef(null);

  const connectSocket = async () => {
    try {
      if (!role || !userID) {
        console.log("Missing role or user ID — skipping socket connection");
        return;
      }

      
      if (socketRef.current) {
        console.log("Disconnecting previous socket...");
        socketRef.current.disconnect();
      }

      console.log(`Creating new socket connection for role: ${role}, id: ${userID} ...`);

      
      const newSocket = io("http://localhost:8000", {
        withCredentials: true,
        query: { role, id: userID },
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected successfully!");
        console.log("Socket ID:", newSocket.id);
        setSocketId(newSocket.id);
      });

      newSocket.on("disconnect", () => {
        console.log("⚠️ Socket disconnected from server");
        setSocketId(null);
      });
    } catch (err) {
      console.error("Socket connection failed:", err);
    }
  };

  // 🔁 Handle connection lifecycle
  useEffect(() => {
    if (isAuthenticated && role && userID) {
      setTimeout(connectSocket, 300);
    } else {
      console.log("Logged out or missing details → disconnecting socket...");
      if (socketRef.current) socketRef.current.disconnect();
      setSocket(null);
      setSocketId(null);
    }
  }, [isAuthenticated, role, userID]);

  return (
    <SocketContext.Provider value={{ socket, socketId, role }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
