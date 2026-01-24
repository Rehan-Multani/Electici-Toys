import { io } from "socket.io-client";

// Adjust URL based on your backend configuration
const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api/v1', '')
    : "http://localhost:3000";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
});
