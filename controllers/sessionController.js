import Session from "../models/session.js";
import 
{   generateSessionId, 
    hashPassword,
    comparePassword,
    generateUserId
} 
from "../utils/helper.js";

export const createSession = async(req,res)=>{
    try{
        const {password , expiryHours} = req.body;
        if(!password || typeof password !== "string"){
            return res.status(400).json({
                success : false,
                error : "Password is required."
            });
        }
        let hours = Number(expiryHours) || 2;
        if(hours <= 0) hours = 2;
        if(hours > 24) hours = 24;
        const sessionId = generateSessionId();
        const hashedPassword = await hashPassword(password);
        const expiresAt = new Date(Date.now() + hours*60*60*1000);
        const session = new Session({
            sessionId,
            password : hashedPassword,
            participants : [],
            messages : [],
            expiresAt,
        });

        await session.save();
        console.log(`Create a session -> Session id : ${sessionId} \t password : ${password}`);
        return res.status(201).json({
            success : true,
            messages : "Session created successfully.",
            sessionId,
            expiresAt,
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            success : false,
            error : "Server error"
        });
    }
};

export const joinSession = async(req,res)=>{
    try{
        const {sessionId,password} = req.body;
        if(!sessionId || !password){
            return res.status(400).json({
                success : false,
                error : "Session ID and password are required",
            });
        }
        console.log(`Join a session -> Session id : ${sessionId} \t password : ${password}`);
        const session = await Session.findOne({sessionId});
        if(!session){
            return res.status(404).json({
                success : false,
                error : "Session not found."
            });
        }
        const isMatched = await comparePassword(password,session.password);
        if(!isMatched){
            return res.status(401).json({
                success : false,
                error : "Wrong password"
            });
        }
        if(session.participants.length >=2){
            return res.status(403).json({
                success : false,
                error : "Session full"
            });
        }
        const userId = generateUserId();
        session.participants.push(userId);
        await session.save();
        return res.status(200).json({
            success:true,
            sessionId : session.sessionId,
            messages : session.messages,
            expiresAt : session.expiresAt,
            userId,
        });

    }catch(error){
        console.error(error);
        return res.status(500).json({
            success : false,
            error : "Server error"
        });
    }
};












