# 📒 Ledger Backend API

A robust RESTful backend for a **digital ledger system** built with Node.js and Express. It supports user authentication with JWT blacklisting, account management, and double-entry style transactions — with email notifications powered by Gmail API via Nodemailer.

---

## 🗂️ Project Structure

```
├── config/
│   └── db.js                    # MongoDB connection setup
├── controllers/
│   ├── accountController.js     # Account creation & retrieval logic
│   ├── authController.js        # Signup, login, logout logic
│   └── transactionController.js # Transaction creation logic
├── middleware/
│   └── authMiddleware.js        # JWT auth & system user guards
├── models/
│   ├── Account.js               # Account schema
│   ├── BlackList.js             # JWT blacklist schema
│   ├── Ledger.js                # Ledger entry schema
│   ├── Transaction.js           # Transaction schema
│   └── User.js                  # User schema
├── routes/
│   ├── accountRoutes.js         # Account-related routes
│   ├── authRoutes.js            # Auth-related routes
│   └── transactionRoutes.js     # Transaction-related routes
├── services/
│   └── email.service.js         # Gmail API + Nodemailer email service
├── app.js                       # Express app setup & route mounting
├── server.js                    # Server entry point
└── package.json
```

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure signup, login, and logout
- 🚫 **Token Blacklisting** — Invalidated tokens stored in DB to prevent reuse after logout
- 👤 **System User** — A privileged system user for seeding initial/internal transactions
- 📂 **Account Management** — Create accounts and fetch all accounts for the logged-in user
- 💸 **Transactions** — Create transactions with ledger entries; initial funding by system user
- 📧 **Email Notifications** — Gmail API + Nodemailer for transactional emails
- 🛡️ **Middleware Guards** — `authUser` for regular users, `authSystemMiddleware` for system-only routes

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- A Google Cloud project with **Gmail API** enabled and OAuth2 credentials

### Installation

```bash
git clone https://github.com/Manvendra-2006/Backend-Ledger.git
cd Backend-Ledger
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ledger_db
JWT_SECRET=your_jwt_secret_here

# Gmail API (OAuth2)
GMAIL_CLIENT_ID=your_google_client_id
GMAIL_CLIENT_SECRET=your_google_client_secret
GMAIL_REFRESH_TOKEN=your_oauth2_refresh_token
GMAIL_USER=your_email@gmail.com

# System User
SYSTEM_USER_EMAIL=system@ledger.internal
SYSTEM_USER_PASSWORD=your_system_password
SYSTEM_SECRET_KEY=your_system_secret_key
```

### Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

---

## 📡 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint    | Access  | Description                              |
|--------|-------------|---------|------------------------------------------|
| POST   | `/signup`   | Public  | Register a new user                      |
| POST   | `/login`    | Public  | Login and receive JWT token              |
| POST   | `/logout`   | Private | Logout and blacklist the current token   |

#### POST `/api/auth/signup`
```json
// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}

// Response 201
{
  "message": "User registered successfully",
  "token": "<jwt_token>"
}
```

#### POST `/api/auth/login`
```json
// Request Body
{
  "email": "john@example.com",
  "password": "securepassword"
}

// Response 200
{
  "message": "Login successful",
  "token": "<jwt_token>"
}
```

#### POST `/api/auth/logout`
```
// Headers
Authorization: Bearer <jwt_token>

// Response 200
{
  "message": "Logged out successfully"
}
```

---

### Account Routes — `/api/accounts`

| Method | Endpoint                    | Access  | Description                              |
|--------|-----------------------------|---------|------------------------------------------|
| POST   | `/`                         | Private | Create a new account for logged-in user  |
| GET    | `/`                         | Private | Get all accounts of the logged-in user   |
| GET    | `/:accountId/balance`       | Private | Get balance of a specific account        |

#### POST `/api/accounts`
```json
// Headers
Authorization: Bearer <jwt_token>

// No request body needed — account is created for the logged-in user automatically

// Response 201
{
  "message": "Account created",
  "account": { ... }
}
```

#### GET `/api/accounts`
```json
// Headers
Authorization: Bearer <jwt_token>

// Response 201
{
  "message": "Logged-in-user account is get",
  "accounts": [ { ... }, { ... } ]
}
```

#### GET `/api/accounts/:accountId/balance`
```json
// Headers
Authorization: Bearer <jwt_token>

// Response 201
{
  "accountId": "64abc...",
  "balance": 5000
}
```

---

### Transaction Routes — `/api/transactions`

| Method | Endpoint           | Access        | Description                                        |
|--------|--------------------|---------------|----------------------------------------------------|
| POST   | `/`                | Private       | Transfer money between two accounts                |
| POST   | `/system/initial`  | System Only   | System user credits initial funds to a user account|

#### POST `/api/transactions`
```json
// Headers
Authorization: Bearer <jwt_token>

// Request Body
{
  "fromAccount": "64abc...",
  "toAccount": "64def...",
  "amount": 500,
  "idempotenezkey": "unique-key-uuid-here"
}

// Response 201
{
  "message": "Transaction completed successfully",
  "transaction": { ... }
}
```

> ⚠️ `idempotenezkey` is **required** and must be unique per transaction request. If a transaction with the same key already exists, the API returns its current status (`COMPLETED`, `PENDING`, `FAILED`, or `REVERSED`) without creating a duplicate.

#### POST `/api/transactions/system/initial`
```json
// Headers
Authorization: Bearer <system_jwt_token>

// Request Body
{
  "toAccount": "64abc...",
  "amount": 10000,
  "idempotenezkey": "unique-key-uuid-here"
}

// Response 201
{
  "message": "Intial funds transaction completed successfully",
  "transaction": { ... }
}
```

---

## 🛡️ Middleware

### `authUser`
Validates the JWT from the `Authorization` header and checks that it is **not blacklisted**. Attaches the decoded user to `req.user`.

### `authSystemMiddleware`
Extends `authUser` to also verify an additional `x-system-key` header, ensuring only the privileged system user can access protected system routes.

---

## 📧 Email Service

Uses **Nodemailer** with **Google OAuth2** (Gmail API) for sending transactional emails. After every successful user-to-user transaction, an email notification is automatically sent to the sender.

```js
// services/email.service.js
// Called internally after createTransaction completes
sendtransactionEmail(userEmail, userName, amount, toAccount)
```

Make sure your Google Cloud project has the Gmail API enabled and you've completed the OAuth2 consent flow to generate a valid refresh token.

---

## 🗄️ Data Models

| Model         | Description                                              |
|---------------|----------------------------------------------------------|
| `User`        | Stores user credentials and profile                      |
| `Account`     | Represents a financial account owned by a user           |
| `Transaction` | Records a transfer between two accounts                  |
| `Ledger`      | Double-entry ledger records (debit/credit per transaction)|
| `BlackList`   | Stores invalidated JWT tokens for logout enforcement     |

---

## 🔒 Security Highlights

- Passwords are hashed with **bcrypt** before storage
- JWT tokens are stateless but **blacklisted on logout** via DB check
- System routes are double-guarded with JWT + a secret key header
- `.env` variables keep all secrets out of source code (never commit `.env`)

---

## 🧰 Tech Stack

| Layer        | Technology                                        |
|--------------|---------------------------------------------------|
| Runtime      | Node.js (ESM — `"type": "module"`)                |
| Framework    | Express.js v5                                     |
| Database     | MongoDB + Mongoose v9                             |
| Auth         | `jsonwebtoken` + `bcryptjs`                       |
| Email        | `nodemailer` + Gmail API (OAuth2)                 |
| Dev Server   | `nodemon` (`npm run dev`)                         |
| Environment  | `dotenv`                                          |
| Other        | `cookie-parser`, `cors`                           |

---

## 📌 Notes

- Ensure the **system user** is seeded in the database (with `systemUser: true`) before using the `/system/initial` endpoint.
- The `Ledger` model follows **double-entry bookkeeping** — every transaction creates both a `DEBIT` entry on the sender's account and a `CREDIT` entry on the receiver's account.
- All transaction operations run inside a **MongoDB session** (`startSession` + `commitTransaction`) to guarantee atomicity.
- The `idempotenezkey` field on transactions prevents duplicate processing — always send a unique key per request (e.g. a UUID).
- Transactions go through status stages: `PENDING` → `COMPLETED` (or `FAILED` / `REVERSED` on errors).
- Token blacklist entries can be cleaned up periodically (e.g., via a cron job) to remove expired tokens.

---

## 📄 License

MIT © 2026
