import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { userJoin, getUsers, userLeave } from "./utils/User"; // Make sure to update your user utils to TypeScript as well

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("server");
});

interface UserData {
    roomId: string;
    userId: string;
    userName: string;
    host: boolean;
    presenter: boolean;
}

let imageUrl: string | undefined, userRoom: string | undefined;

io.on("connection", (socket) => {
    socket.on("user-joined", (data: UserData) => {
        const { roomId, userName, host, presenter } = data;
        userRoom = roomId;
        const user = userJoin(socket.id, userName, roomId, host, presenter);
        const roomUsers = getUsers(user.room);
        socket.join(user.room);
        socket.emit("message", {
            message: "Welcome to ChatRoom",
        });
        socket.broadcast.to(user.room).emit("message", {
            message: `${user.username} has joined`,
        });

        io.to(user.room).emit("users", roomUsers);
        io.to(user.room).emit("canvasImage", imageUrl);
    });

    socket.on("drawing", (data: string) => {
        imageUrl = data;
        socket.broadcast.to(userRoom!).emit("canvasImage", imageUrl);
    });

    socket.on("disconnect", () => {
        const userLeaves = userLeave(socket.id);
        if (userLeaves) {
            const roomUsers = getUsers(userLeaves.room);
            io.to(userLeaves.room).emit("message", {
                message: `${userLeaves.username} left the chat`,
            });
            io.to(userLeaves.room).emit("users", roomUsers);
        }
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`server is listening on http://localhost:${PORT}`));
