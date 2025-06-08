import express, { Request, Response } from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import url from "url";
import dotenv from 'dotenv'
dotenv.config();

interface ExtWebSocket extends WebSocket {
    roomId?: string | string[];
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: ExtWebSocket, req: Request) => {
    const parameters = url.parse(req.url || "", true);
    const roomId = parameters.query.roomId;

    ws.roomId = roomId;
    console.log(`New client connected to room: ${roomId}`);

    ws.on("message", (message) => {
        console.log("Received:", message.toString());

        wss.clients.forEach((client) => {
            const c = client as ExtWebSocket;
            if (
                c.readyState === WebSocket.OPEN &&
                c.roomId === ws.roomId
            ) {
                c.send(message.toString());
            }
        });
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

app.get("/", (req: Request, res: Response) => {
    res.send("WebSocket server is running.");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:8000`);
});
