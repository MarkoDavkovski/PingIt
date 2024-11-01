import express from "express";
import http from "http";
import config from "./config/config.js";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

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
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
