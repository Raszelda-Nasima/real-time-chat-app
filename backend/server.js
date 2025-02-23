require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

// Import Message Model
const Message = require("./models/Message");

// Create Express app
const app = express();
const server = http.createServer(app); // ✅ Create the server first

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ✅ Define io AFTER creating the server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Handle Socket.io Events
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Send previous messages to new user
  Message.find().then((messages) => {
    socket.emit("previousMessages", messages);
  });

  socket.on("chatMessage", async (msg) => {
    const newMessage = new Message({ user: "Anonymous", text: msg });
    await newMessage.save();
    io.emit("chatMessage", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
