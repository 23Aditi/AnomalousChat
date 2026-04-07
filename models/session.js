import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
    userId:{
        type : String,
        required : true
    },
    text : {
        type : String,
        required : true
    },
    timeStamp : {
        type : Date,
        default : Date.now
    }
});

const sessionSchema = new mongoose.Schema({
    sessionId : {
        type : String,
        unique : true,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    participants : {
        type : [String],
        default : []
    },
    messages : {
        type : [messageSchema],
        default : [],
    },
    expiresAt : {
        type : Date,
        required : true
    }
});

sessionSchema.index(
    {expiresAt : 1 }, {expireAfterSeconds : 0}
);

sessionSchema.methods.isFull = function(){
    return this.participants.length >=2;
};

const Session = mongoose.model('Session',sessionSchema);
export default Session;
