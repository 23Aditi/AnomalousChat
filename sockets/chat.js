import Session from "../models/session.js";
import {comparePassword} from "../utils/helper.js";
const chatSocket = (io)=>{
    io.on('connection',(socket)=>{
            console.log('User connected : ',socket.id);
            socket.on('joinSession',async({sessionId, userId, password},cb)=>{
                try{
                    const session = await Session.findOne({sessionId});
                    if(!session) return cb({error : 'Session not found'});
                    const isMatched = await comparePassword(password,session.password);
                    if(!isMatched){
                        return cb({error : 'Wrong password'});
                    }

                    if(!session.participants.includes(userId)){
                        if(session.participants.length>=2){
                            return cb({
                                error:'Session full'
                            });
                        }
                        session.participants.push(userId);
                        await session.save();
                    }
                    socket.join(sessionId);
                    socket.sessionId = sessionId;
                    socket.userId = userId;

                    cb({
                        success : true,
                        messages : session.messages // history
                    });
                }catch(error){
                    console.error(error);
                }
            });

            socket.on('sendMessage',async ({text})=>{
                const {sessionId,userId} = socket;
                if(!sessionId) return;
                const session = await Session.findOne({sessionId});
                if(!session) return;
                const message = {userId,text};
                session.messages.push(message);
                await session.save();
                io.to(sessionId).emit('receiveMessage',message);
            });

            socket.on('disconnect',async()=>{
                const {sessionId,userId} = socket;
                if(!sessionId) return;
                await Session.updateOne(
                    {sessionId},
                    {$pull : {participants : userId}}
                );
                console.log(`User ${userId} left ${sessionId}`);
            });

            socket.on('terminateSession',async()=>{
                const {sessionId, userId} = socket;
                if(!sessionId) return;
                io.to(sessionId).emit('sessionTerminated',{
                    messages : 'Session ended by a user'
                });
                io.in(sessionId).socketsLeave(sessionId);
                await Session.deleteOne({sessionId});
                console.log(`Session ${sessionId} terminated by ${userId}`);
            });
            socket.on('leaveSession',async()=>{
                const {sessionId,userId} = socket;
                if(!sessionId || !userId) return;
                try{
                    await Session.updateOne(
                        {sessionId},
                        {$pull : {participants : userId}}
                    );
                    socket.to(sessionId).emit('userLeft',{
                        message : 'The other user has left the chat.'
                    });
                    socket.leave(sessionId);
                    delete socket.sessionId;
                    delete socket.userId;
                    console.log(`User ${userId} left the session ${sessionId}`);
                    socket.emit('leaveSessionSuccess',{
                        messages : 'Session left by user.'
                    });
                }catch(error){
                    console.error('Error leaving session: ',error);
                }
            });
        });
    
};


export default chatSocket;


