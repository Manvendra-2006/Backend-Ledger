import mongoose from "mongoose";
const ledgerSchema = mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"AccountData",
        required:true,
        index:true,
        immutable:true // means it can't be modified 
    },
    amount:{
        type:Number,
        required:true,
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"TransactionData"   ,
        required:true,
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"Type can be either CREDIT or DEBIT",
        },
        required:true,
        immutable:true
    },    
})

function preventLedgerModification(){
    throw new Error("Ledger enteries are immutable and cannot be modified or deleted")
}
ledgerSchema.pre("findOneAndUpdate",preventLedgerModification)
ledgerSchema.pre("updateOne",preventLedgerModification)
ledgerSchema.pre("deleteOne",preventLedgerModification)
ledgerSchema.pre('remove',preventLedgerModification)
ledgerSchema.pre('deleteMany',preventLedgerModification)
ledgerSchema.pre('updateMany',preventLedgerModification)
ledgerSchema.pre('findOneAndDelete',preventLedgerModification)
ledgerSchema.pre('findOneAndReplace',ledgerSchema)

export default mongoose.model("ledgerData",ledgerSchema)


// Ledger is a single source of truth 