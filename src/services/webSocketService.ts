import { Server as SocketIOServer } from "socket.io";
import http from "http";
import prisma from "../utils/database";
import jwt from "jsonwebtoken";

export const setupWebSocket = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    jwt.verify(token as string, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error"));
      }
      socket.data.user = decoded;
      next();
    });
  });

  io.on("connection", (socket) => {
    console.log("new client connected: ", socket.id);
    const userId = socket.data.user?.userId;
    console.log("logged in user: ", userId);

    socket.on("chatMessage", async (message) => {
      console.log("message received: ", message);
      await prisma.chat.create({
        data: {
          message: message,
          user_id: userId,
        },
      });
      io.emit("chatMessage", { message, user: userId });
    });

    socket.on("disconnect", () => {
      console.log("connection disconnected", socket.id);
    });
  });
};
