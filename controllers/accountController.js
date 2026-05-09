import AccountData from "../models/Account.js";
// This api create account 
export async function createAccount(req,resp){
    try{
        const user = req.user
        if(!user){
            return resp.status(400).json({message:"User data required"})
        }
        const account = await AccountData.create({
            user:user.id,
        })
        return resp.status(201).json({message:"Account created",account})
    }
    catch(error){
        return resp.status(500).json({message:"Internal Server Error",error})
    }
}
// This api get all account of the logged in user 
export async function getUserAccountController(req,resp){
    try{
        const account = await AccountData.find({user:req.user.id})
        if(!account){
                return resp.status(404).json({message:"Account is not get"})
        }
        return resp.status(201).json({message:"Logged-in-user account is get",account})
    }
    catch(error){
        return resp.status(500).json({message:"Internal Server Error",error})
    }
}
// THis controller get balance 
export async function getAccountBalanceController(req,resp){
    try{
        const accountId = req.params.accountId
        const accountExists = await AccountData.findOne({
            _id:accountId,
            user:req.user.id
        })   

        if(!accountExists){
            return resp.status(404).json({message:"Account is not exists "})
        }

        const balance = await accountExists.getBalance()
        return resp.status(201).json({
            accountId:accountExists._id,
            balance:balance
        })
    }
    catch(error){
        return resp.status(500).json({message:"Internal Server Error",error})
    }
}

