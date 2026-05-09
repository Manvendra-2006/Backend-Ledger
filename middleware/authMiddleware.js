import jwt from 'jsonwebtoken'
import blacklistData from '../models/BlackList.js'
import User from '../models/User.js'
export async function authUser(req, resp, next) {
    const token = req.cookies.token
    if (!token) {
        return resp.status(401).json({ message: "Authentication token is required" })
    }
    const blacklist = await blacklistData.findOne({ token })
    if (blacklist) {
        return resp.status(401).json({ message: "Token is blacklisted" })
    }
    try {
        const decoded = await jwt.verify(token, process.env.JWT_TOKEN)
        req.user = decoded
        next()
    }
    catch (error) {
        return resp.status(401).json({ message: "Invalid or expired token", error })
    }
}
export async function authSystemUserMiddleware(req, resp, next) {
    const token = req.cookies.token
    if (!token) {
        return resp.status(401).json({ message: "Authentication token is required" })
    }
    const blacklist = await blacklistData.findOne({ token })
    if (blacklist) {
        return resp.status(401).json({ message: "Token is blacklisted" })
    }
    try {
        const decoded = await jwt.verify(token, process.env.JWT_TOKEN)
        const user = await User.findById(decoded.id).select("+systemUser")
        if (!user) {
            return resp.status(404).json({ message: "User not found" })
        }

        if (!user.systemUser) {
            return resp.status(403).json({ message: "Forbidden: user is not a system user" })
        }


        req.user = user
        return next()
    }
    catch (error) {
        return resp.status(401).json({ message: "Invalid or expired token", error })
    }
}