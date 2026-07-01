import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import { createCorsOptions, getAllowedOrigins } from "./cors.js";
import { setupSocket } from "./socket.js";

const PORT = Number(process.env.PORT) || 3001;
const allowedOrigins = getAllowedOrigins();
const primaryOrigin = allowedOrigins[0] ?? "http://localhost:3000";

const app = express();
app.use(cors(createCorsOptions()));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "doora-realtime",
    origins: allowedOrigins,
  });
});

const server = http.createServer(app);
setupSocket(server, allowedOrigins);

server.listen(PORT, () => {
  console.log(`Realtime server on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
  console.log(`Primary origin: ${primaryOrigin}`);
});
