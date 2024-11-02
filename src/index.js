import express from "express";
import http from "http";
import config from "./config/config.js";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { Filter } from "bad-words";

const { port } = config;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.broadcast.emit("userConnected", {
    message: "New user has been connected",
  });

  socket.on("sendMessage", ({ username, message }, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.emit("newMessage", { username, message });
    callback();
  });

  socket.on("sendLocation", ({ latitude, longitude, username }, callback) => {
    const locationURL = `https://google.com/maps?q=${latitude},${longitude}`;
    io.emit("locationReceived", { username, locationURL });
    callback();
  });

  socket.on("disconnect", () => {
    console.log("User has disconnected");
    io.emit("userDisconnected", {
      message: "A user has disconnected",
    });
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
