import express from 'express'
import { authUser } from '../middleware/authMiddleware.js'
import { createAccount, getAccountBalanceController, getUserAccountController } from '../controllers/accountController.js'
const accountRouter = express.Router()
accountRouter.post("/",authUser,createAccount)
accountRouter.get("/getaccount",authUser,getUserAccountController)
accountRouter.get("/balance/:accountId",authUser,getAccountBalanceController)
export default accountRouter