import express from 'express'
import { authUser } from '../middleware/authMiddleware.js'
import { createAccount } from '../controllers/accountController.js'
const accountRouter = express.Router()
accountRouter.post("/",authUser,createAccount)
export default accountRouter