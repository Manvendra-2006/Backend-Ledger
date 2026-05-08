import AccountData from "../models/Account"
import TransactionData from "../models/Transaction.js"
function createTransaction(req,resp){
    try{
        const {fromAccount,toAccount,amount,idempotenezkey} = req.body
        if(!fromAccount||!toAccount||!amount||!idempotenezkey){
            return resp.status(400).json({message:"All fields are required"})
        }
        const fromAccountExists = await AccountData.findOne({
            _id:fromAccount
        })
        const toAccountExists = await AccountData.findOne({
            _id:toAccount
        })
        if(!fromAccountExists||!toAccountExists){
            return resp.status(400).json({message:"Account does'not exists"})
        }
        const transaction = await TransactionData.create({
            fromAccount,
            toAccount,
            amount,
            idempotenezkey
        })
        return resp.status(201).json({message:"Transaction is created",transaction})
    }

    catch(error){
        return resp.status(500).json({message:"Internal Server Error",error})
    }
}