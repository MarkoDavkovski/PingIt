import express from "express";
import http from "http";
import config from "./config/config.js";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { Filter } from "bad-words";
import { getUser, getUserInRoom, addUser, removeUser } from "./utils/users.js";

const { port } = config;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  socket.on("userJoin", ({ username, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, username, room });

    if (error) return callback(error);
    socket.join(user.room);

    socket.broadcast.to(user.room).emit("userConnected", {
      message: `${user.username} has joined the room`,
    });
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (data, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    const { message } = data;
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to(user.room).emit("newMessage", data);
    callback();
  });

  socket.on("sendLocation", (data, callback) => {
    const user = getUser(socket.id);
    const { latitude, longitude, username, createdAt } = data;
    const locationURL = `https://google.com/maps?q=${latitude},${longitude}`;
    io.to(user.room).emit("locationReceived", {
      username,
      locationURL,
      createdAt,
    });
    callback();
  });

  socket.on("disconnect", () => {
    const removedUser = removeUser(socket.id);

    if (removedUser) {
      io.to(removedUser.room).emit("roomData", {
        room: removedUser.room,
        users: getUserInRoom(removedUser.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
