import http from "http";
import {Server} from "socket.io";
import dotenv from "dotenv";
import connectDb from "./db.js";
import chatSocket from "./sockets/chat.js";
import app from "./app.js";


dotenv.config();

const PORT = process.env.PORT || 5000;

await connectDb();

const server = http.createServer(app);

const io = new Server(server, {
    cors : {
        origin : '*',
        methods : ['GET','POST']
    }
});

chatSocket(io);


server.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});







