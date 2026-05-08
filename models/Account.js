import mongoose from "mongoose";
const accountSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true,"Account associated with user"],
        index:true  // to increase speed
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE","FROZEN","CLOSED"],
            message:"Status can be either active,frozen or closed"
        },
        default:"ACTIVE"
    },
    currency:{
        type:String,
        required:[true,"Currency is required for creating an account"],
        default:"INR"
    }
},{
    timestamps:true
})

accountSchema.index({user:1,status:1})   // Compound index is used for finding data 
// 1 stands for ascending order
// -1 stands for descending order
export default mongoose.model("AccountData",accountSchema)