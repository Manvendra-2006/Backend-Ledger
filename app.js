import express from 'express'
import authRouter from './routes/authRoutes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import accountRouter from './routes/accountRoutes.js'
import transactionRouter from './routes/transactionRoutes.js'
const app = express()
app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/account",accountRouter)
app.use("/api/transaction",transactionRouter)
export default app