import User from "../models/User.js"
import jwt from 'jsonwebtoken'
import {sendRegistrationEmail} from "../services/email.service.js"
import blacklistData from "../models/BlackList.js"
export async function registerController(req,resp){
    try{
        const {name,email,password} = req.body
        if(!name||!email||!password){
            return resp.status(200).json({message:"Required All fields"})
        }
        const user = await User.findOne({email})
        if(user){
            return resp.status(400).json({message:"User already exists"})
        }
        const userData = await User.create({
            name,
            email,
            password
        })
        return resp.status(201).json({message:"User is created",userData})
    }
    catch(error){
        return resp.status(500).json({message:"Internal Server Error",error})
    }
 }
export async  function loginController(req,resp){
    try{
        const {email,password} = req.body
        if(!email||!password){
            return resp.status(400).json({message:"All fields are required"})
        }
        const userExists = await User.findOne({email}).select("+password")
        if(!userExists){
            return resp.status(400).json({message:"Please login first"})
        }
        const isMatch = await userExists.comparePassword(password)
        if(!isMatch){
            return resp.status(400).json({message:"Password is invlaid"})
        }
        const token = jwt.sign(
            {id:userExists._id,email:userExists.email,name:userExists.name},
            process.env.JWT_TOKEN,
            {expiresIn:'7d'}
        )
        resp.cookie("token",token)
         await sendRegistrationEmail(userExists.email,userExists.name)
        return resp.status(201).json({message:"Login Successfully",userExists})
       
    }
    catch(error){
        return resp.status(500).json({message:"Internal Server Error",error})
    }
}

export async function logoutController(req,resp){
    try{
        const token = req.cookies.token
        if(!token){
            return resp.status(400).json({message:"Token is invlaid"})
        }
        const blacklist = await blacklistData.create({token})
        if(blacklist){
            resp.clearCookies("token")
            return resp.status(201).json({message:"Token is blacklisted"})
        }
    }
    catch(error){
        return resp.status(500).json({message:"Internal Server Error",error})
    }
}