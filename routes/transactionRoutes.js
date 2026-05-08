import express from 'express'
import { authUser } from '../middleware/authMiddleware.js'
import { createTransaction } from '../controllers/transactionController.js'
const transactionRouter = express.Router()
transactionRouter.post("/",authUser,createTransaction)
export default transactionRouter