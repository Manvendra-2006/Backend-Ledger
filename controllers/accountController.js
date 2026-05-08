import AccountData from "../models/Account.js";
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