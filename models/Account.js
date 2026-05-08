import mongoose from "mongoose";
import ledgerData from "../models/Ledger.js"
const accountSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Account associated with user"],
        index: true  // to increase speed
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either active,frozen or closed"
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "Currency is required for creating an account"],
        default: "INR"
    }
}, {
    timestamps: true
})

accountSchema.index({ user: 1, status: 1 })   // Compound index is used for finding data 
// 1 stands for ascending order
// -1 stands for descending order

accountSchema.methods.getBalance = async function () {
    const balanceData = await ledgerData.aggregate([  // iska mtlb this._id main jo id hain current account ki uske related jitne ledger hain un sabko find karo 
        { $match: { account: this._id } },
        {
            $group: {
                _id: null, // _id mtlb sabko ek group main combine kro ya ek bucket main yadi _id kuch aur dete toh har group ke liye algag gorup banta hain
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "DEBIT"] },
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "CREDIT"] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0, // iska _id:0 ka mtlb id show mat krna  // _id : 1 ka mtlb is show krna  
                balance: { $subtract: ["$totalCredit", "$totalDebit"] }
            }
        }
    ])
    if (balanceData.length === 0) {
        return 0
    }
    return balanceData[0].balance
}
export default mongoose.model("AccountData", accountSchema)