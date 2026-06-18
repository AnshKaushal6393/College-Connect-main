import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import auth from "./routes/auth.js";
import cookieParser from "cookie-parser";
import profileRoutes from "./routes/profile.js";
import adminRoutes from "./routes/admin.js";
import roleTranstionRoutes from "./routes/roleTransition.js";
import hackathonRoutes from "./routes/hackathon.js";
import networkRoutes from "./routes/network.js";
import teamBuilderRoutes from "./routes/teamRoutes.js";
import resourceRoutes from "./routes/resource.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { createServer } from "http";
import { Server } from "socket.io";
import chatRoutes from "./routes/chat.js";
import userRoutes from "./routes/userRoutes.js";
dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "https://college-connect-main.vercel.app/"
).replace(/\/$/, "");

const allowedOrigins = [
  FRONTEND_URL,
  `${FRONTEND_URL}/`,
  "http://localhost:5173",
  "http://localhost:5000",
];

console.log("Allowed CORS origins:", allowedOrigins);

// ⭐ FIXED: Added explicit path for Socket.io
const io = new Server(httpServer, {
  path: "/socket.io/", // ⭐ Explicitly set Socket.io path (default, but good to be explicit)
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  // ⭐ Additional reliability options
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"], // Try websocket first
});

app.set("io", io);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, "");
      const isAllowed = allowedOrigins.some(
        (allowedOrigin) => allowedOrigin.replace(/\/$/, "") === normalizedOrigin
      );
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`Cors Blocked: ${origin}`);
        callback(new Error("Not allowed by cors"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ⭐ All API routes under /api prefix
app.use("/api/auth", auth);
app.use("/api/admin", adminRoutes);
app.use("/api/role-transition", roleTranstionRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/network", networkRoutes);
app.use("/api/team-builder", teamBuilderRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users",userRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "CollegeConnect Backend API is running",
    timestamp: new Date(),
  });
});

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
  });
});

// ⭐ IMPORTANT: Error handlers should be AFTER all routes but BEFORE Socket.io
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Online users tracking. Each user can have multiple sockets open, e.g. browser tabs.
const onlineUsers = new Map();

const getOnlineUserIds = () => Array.from(onlineUsers.keys());

const addOnlineSocket = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socketId);
};

const removeOnlineSocket = (userId, socketId) => {
  const userSockets = onlineUsers.get(userId);

  if (!userSockets) {
    return false;
  }

  userSockets.delete(socketId);

  if (userSockets.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }

  return false;
};

io.on("connection", (socket) => {
  console.log("🔌 User Connected:", socket.id);

  // User comes online
  socket.on("user:online", (userId) => {
    if (socket.userId && socket.userId !== userId) {
      removeOnlineSocket(socket.userId, socket.id);
    }

    socket.userId = userId; // Store userId in socket for disconnect
    addOnlineSocket(userId, socket.id);

    io.emit("users:online", getOnlineUserIds());
    console.log(`✅ User ${userId} is online. Total online:`, onlineUsers.size);
  });

  // Join conversation room
  socket.on("join:conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`📥 Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Send message
  socket.on("message:send", (data) => {
    const { conversationId, message } = data;
    io.to(conversationId).emit("message:received", message);
    console.log(`💬 Message sent to conversation ${conversationId}`);
  });

  // Typing indicators
  socket.on("typing:start", (data) => {
    const { conversationId, userId, userName } = data;
    socket.to(conversationId).emit("typing:user", { userId, userName });
  });

  socket.on("typing:stop", (data) => {
    const { conversationId, userId } = data;
    socket.to(conversationId).emit("typing:stop", { userId });
  });

  // User disconnects
  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", socket.id);

    // Remove from online users using stored userId
    if (socket.userId) {
      const userWentOffline = removeOnlineSocket(socket.userId, socket.id);
      io.emit("users:online", getOnlineUserIds());
      console.log(
        `❌ Socket ${socket.id} removed for user ${socket.userId}. Total online:`,
        onlineUsers.size
      );

      if (!userWentOffline) {
        console.log(`User ${socket.userId} still has another active socket`);
      }
    }
  });

  // Manual offline event (optional, for explicit logout)
  socket.on("user:offline", (userId) => {
    removeOnlineSocket(userId, socket.id);
    io.emit("users:online", getOnlineUserIds());
    console.log(`👋 Socket ${socket.id} went offline manually for user ${userId}`);
  });
});

console.log("Backend starting...");

httpServer.listen(PORT, () => {
  console.log(`🚀 SERVER RUNNING on port ${PORT}`);
  console.log(`🔌 Socket.IO ready at path: /socket.io/`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ CORS enabled for: ${allowedOrigins.join(", ")}`);
});

if (process.env.NODE_ENV === "production") {
  setInterval(async () => {
    try {
      await fetch(
        "https://college-connect-backend-51sw.onrender.com/api/health"
      );
      console.log("Self ping to keep backend awake");
    } catch (error) {
      console.error("ping failed", error.message);
    }
  }, 4 * 60 * 1000);
}
