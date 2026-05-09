import mongoose from "mongoose"
import AccountData from "../models/Account.js"
import TransactionData from "../models/Transaction.js"
import ledgerData from "../models/Ledger.js"
import { sendtransactionEmail } from "../services/email.service.js"
import User from "../models/User.js"
// This API is used to transfer money from one user account to another user account
export async function createTransaction(req, resp) {
    try {
        // validate request or check request
        const { fromAccount, toAccount, amount, idempotenezkey } = req.body
        if (!fromAccount || !toAccount || !amount || !idempotenezkey) {
            return resp.status(400).json({ message: "All fields are required" })
        }
        const fromAccountExists = await AccountData.findOne({
            _id: fromAccount
        })
        const toAccountExists = await AccountData.findOne({
            _id: toAccount
        })
        if (!fromAccountExists || !toAccountExists) {
            return resp.status(400).json({ message: "Account does'not exists" })
        }

        // validate idempotenzy key

        const isTransactionAlreadyExists = await TransactionData.findOne({
            idempotenezkey: idempotenezkey
        })

        if (isTransactionAlreadyExists) {
            if (isTransactionAlreadyExists.status === "COMPLETED") {
                return resp.status(200).json({
                    message: "Transaction already processed",
                    transaction: isTransactionAlreadyExists
                })
            }
            if (isTransactionAlreadyExists.status === "PENDING") {
                return resp.status(404).json({
                    message: "Transaction is pending"
                })
            }
            if (isTransactionAlreadyExists.status === "FAILED") {
                return resp.status(500).json({
                    message: "Transaction is failed."
                })
            }
            if (isTransactionAlreadyExists.status === "REVERSED") {
                return resp.status(505).json({
                    message: "Transaction is reversed.please retry"
                })
            }
        }

        // check amount status 

        if (fromAccountExists.status !== "ACTIVE" || toAccountExists.status !== "ACTIVE") {
            return resp.status(404).json({ message: "Account is not active may it looks like falied or closed" })
        }

        // Derive Sender Balance from ledger 

        const balance = await fromAccountExists.getBalance() // find the balance of particular user which sends money

        if (balance < amount) {
            return resp.status(400).json({ message: `Don't have a sufficient amount . Total current balance is : ${balance} , Requested Amount is : ${amount}` })
        }

        // Create Transaction (PENDING)

        const session = await mongoose.startSession()
        session.startTransaction()

        const transaction = new TransactionData({
            fromAccount,
            toAccount,
            amount,
            idempotenezkey,
            status: "PENDING"
        })
        // creating ledger entry debit
        const debitLedgerEntry = await ledgerData.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })
        // creating ledger entry credit
        const creditLedgerEntry = await ledgerData.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })
        // making transaction completed
        transaction.status = "COMPLETED"
        await transaction.save({ session })
        // here end session
        await session.commitTransaction()
        session.endSession()

        // send email notification
        await sendtransactionEmail(req.user.email, req.user.name, amount, toAccount)

        return resp.status(201).json({ message: "Transaction completed successfully", transaction })


    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error })
    }
}
// ye api user ko money send karega ye uske liye hain kya 
//// This API is used to send initial funds from the system account to a user's account
export async function createInitialFundsTransaction(req, resp) {
    try {
        const { toAccount, amount, idempotenezkey } = req.body
        if (!toAccount || !amount || !idempotenezkey) {
            return resp.status(404).json({ message: "All fields are required" })
        }
        const toUserAccount = await AccountData.findById(toAccount)
        if (!toUserAccount) {
            return resp.status(404).json({ message: "The account is not exists where amount is to be credited" })
        }

        const systemUser = await User.findOne({
            systemUser: true
        })
        if (!systemUser) {
            return resp.status(404).json({ message: "systemUser not found" })
        }
        const fromUserAccount = await AccountData.findOne({
            user: systemUser._id
        })


        if (!fromUserAccount) {
            return resp.status(400).json({ message: "System user account not found" })
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        const transaction = new TransactionData({
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotenezkey,
            status: "PENDING"
        })

        const debitLedgerEntry = await ledgerData.create([{
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        const creditLedgerEntry = await ledgerData.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        transaction.status = "COMPLETED"
        await transaction.save({ session })

        await session.commitTransaction()
        session.endSession()

        return resp.status(201).json({ message: "Intial funds transaction completed successfully", transaction })

    }
    catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error })
    }
}
