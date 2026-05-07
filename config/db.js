import mongoose from "mongoose";
export default async function connectDb(){
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("DataBase is connected")
    }
    catch(err){
        console.log("Database is not connected")
    }    
}