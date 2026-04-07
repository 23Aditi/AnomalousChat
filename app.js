import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sessionRoutes from "./routes/session.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/session",sessionRoutes)

app.get('/',(req,res)=>{
    res.status(200).json({
        message : "Backend running successfully!"
    });
});

export default app;
