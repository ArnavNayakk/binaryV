import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "./config/api";

const SOCKET_URL = SOCKET_BASE_URL;

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("🔗 Connected to WebSocket:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  }
  return socket;
};

export const getSocket = () => socket;
