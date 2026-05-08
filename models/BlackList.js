import mongoose from "mongoose";
const blacklistSchema = mongoose.Schema({
    token:{
        type:String,
        required:true
    }
},{
    timestamps:true
})
export default mongoose.model("blacklistData",blacklistSchema)