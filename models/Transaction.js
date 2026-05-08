import mongoose from "mongoose";
const transactionSchema  = mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"AccountData",
        required:true,
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
         ref:"AccountData",
        required:true,
        index:true
    },
    amount:{
        type:Number,
        required:true,
        min:0
    },
    idempotenezkey:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            message:"Account status can be pending or complete or failed"
        },
        default:"Pending"
    }
},{
    timestamps:true
})
  
export default mongoose.model("TransactionData",transactionSchema)