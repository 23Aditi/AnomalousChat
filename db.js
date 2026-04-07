import mongoose from "mongoose";

const connectDb = async(req,res)=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected successfully!");
    }catch(error){
        console.error(error);
        process.exit(1);
    }
};

export default connectDb;
