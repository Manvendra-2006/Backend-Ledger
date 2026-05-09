import express from 'express'
import { authSystemUserMiddleware, authUser } from '../middleware/authMiddleware.js'
import { createInitialFundsTransaction, createTransaction } from '../controllers/transactionController.js'
const transactionRouter = express.Router()
transactionRouter.post("/",authUser,createTransaction)

transactionRouter.post("/system/intial-funds",authSystemUserMiddleware,createInitialFundsTransaction)

export default transactionRouter