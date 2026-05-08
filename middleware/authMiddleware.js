import jwt from 'jsonwebtoken'
import blacklistData from '../models/BlackList.js'
export async function authUser(req,resp,next){
    const token = req.cookies.token
    if(!token){
        return resp.status(400).json({message:"Token is not provided"})
    }
    const blacklist = await blacklistData.findOne({token})
    if(blacklist){
        return resp.status(400).json({message:"Token is blacklisted"})
    }
    try{
        const decoded = await jwt.verify(token,process.env.JWT_TOKEN)
        req.user = decoded
        next()
    }
    catch(error){
        return resp.status(500).json({message:"Internal Server Error",error})
    }
}