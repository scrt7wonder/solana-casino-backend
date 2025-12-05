# 🎰 Solbet - Solana Casino Game Backend

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Solana](https://img.shields.io/badge/Solana-Web3.js-purple.svg)](https://solana.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

> **A decentralized casino game backend built on Solana blockchain** - Powering transparent, secure, and fair jackpot gaming experiences with real-time updates and smart contract integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Socket Events](#socket-events)
- [Smart Contract Integration](#smart-contract-integration)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

### Stay Connected
| Platform | Link | Purpose |
|----------|------|---------|
| Telegram | [t.me/FroganBee.sol](https://t.me/froganbee_sol) | Announcements & Support |
| X | [x.com/0xFortuneRust](https://x.com/0xFortuneRust) | News & Updates |

## 🎯 Overview

**Solbet** is a cutting-edge **Solana casino game** backend that leverages blockchain technology to provide a transparent and secure gaming platform. This project implements a **jackpot casino game** system where players can participate in rounds, place bets using SOL (Solana's native cryptocurrency), and compete for rewards in a provably fair environment.

### Key Highlights

- 🎲 **Decentralized Casino Game**: Built on Solana blockchain for transparency and security
- ⚡ **Real-time Gaming**: WebSocket-powered live updates for game rounds and player interactions
- 🔐 **Smart Contract Integration**: Automated winner selection and reward distribution via Solana programs
- 💰 **Jackpot System**: Multi-round jackpot game with configurable duration and platform fees
- 📊 **Comprehensive Tracking**: Full history of bets, rounds, and rewards stored in MongoDB
- 💬 **Live Chat**: Real-time chat service for enhanced player engagement

## ✨ Features

### 🎮 Game Features
- **Round-based Jackpot System**: Automated game rounds with configurable duration
- **Provably Fair Gaming**: Winner selection and reward distribution handled by Solana smart contracts
- **Real-time Updates**: Live countdown timers, round updates, and winner announcements via WebSocket
- **Bet Tracking**: Comprehensive wager tracking per user and round
- **Reward Distribution**: Automated SOL reward distribution to winners

### 🔧 Technical Features
- **RESTful API**: Well-structured endpoints for authentication, game history, and round management
- **WebSocket Communication**: Real-time bidirectional communication for game state and chat
- **JWT Authentication**: Secure user authentication and authorization
- **MongoDB Integration**: Persistent storage for users, rounds, history, and messages
- **Error Handling**: Comprehensive error handling and logging with Winston
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Secure cross-origin resource sharing

### 🛡️ Security Features
- **Input Validation**: Express-validator for request validation
- **MongoDB Sanitization**: Protection against NoSQL injection attacks
- **Environment-based Configuration**: Secure credential management
- **Smart Contract Verification**: All game logic verified on-chain

## 🛠️ Tech Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.8
- **Framework**: Express.js 5.1
- **Database**: MongoDB with Mongoose ODM

### Blockchain & Web3
- **Solana SDK**: @solana/web3.js 1.98
- **Anchor Framework**: @coral-xyz/anchor 0.31
- **Smart Contracts**: Solana Program (Anchor-based)

### Real-time Communication
- **WebSocket**: Socket.io 4.8

### Authentication & Security
- **JWT**: jsonwebtoken 9.0
- **CORS**: cors 2.8
- **Rate Limiting**: express-rate-limit 7.5
- **Input Validation**: express-validator 7.2
- **Sanitization**: express-mongo-sanitize 2.2

### Utilities
- **Logging**: Winston 3.17 with daily rotation
- **HTTP Client**: Axios 1.10
- **Scheduling**: node-cron 4.1
- **Big Number**: bn.js 5.2

## 🏗️ Architecture

```
Solbet Backend
├── Controllers      # Request handlers (Auth, Round, History, Socket)
├── Services         # Business logic (Game, Chat, Round, Auth, History)
├── Models           # MongoDB schemas (User, Round, History, Message, Referral)
├── Routes           # API route definitions
├── Middlewares      # Auth, error handling, validation
├── Contract         # Solana smart contract integration
│   ├── solbet.ts    # Contract interaction functions
│   └── idl/         # Anchor IDL definitions
├── Types            # TypeScript type definitions
├── Utils            # Helper functions, errors, logger
└── Config           # Constants, database, environment config
```

### Data Flow

1. **User Registration**: Users register with Solana wallet address
2. **Game Participation**: Players join rounds by depositing SOL via smart contract
3. **Round Management**: Backend monitors deposits and manages round lifecycle
4. **Winner Selection**: Smart contract selects winner based on weighted probability
5. **Reward Distribution**: Automated SOL transfer to winner's wallet
6. **History Tracking**: All transactions and game events stored in MongoDB

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local or cloud instance)
- **Solana CLI** (for smart contract deployment)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/solbet-be.git
cd solbet-be
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build TypeScript

```bash
npm run build
```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017/solbet

# Solana Configuration
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
CLUSTER=mainnet-beta
ADMIN=<your-admin-keypair-base58-encoded>

# Team Wallet (Public Key)
TEAM_WALLET=6fqaR9EfVoeWounR9psLmgQ1Jr3y43GbLMHGvWDyGMvH

# Platform Configuration
PLATFORM_FEE=500
ROUND_DURATION=60

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS Configuration
ALLOW_HOSTS=http://localhost:3000
SOCKET_ALLOW_HOSTS=http://localhost:3000
```

### Environment Variables Explained

- **PORT**: Server port (default: 5000)
- **MONGO_URL**: MongoDB connection string
- **RPC_ENDPOINT**: Solana RPC endpoint (use mainnet or devnet)
- **ADMIN**: Base58-encoded admin keypair for smart contract interactions
- **TEAM_WALLET**: Public key of team wallet for fee collection
- **PLATFORM_FEE**: Platform fee in basis points (e.g., 500 = 5%)
- **ROUND_DURATION**: Round duration in seconds
- **JWT_SECRET**: Secret key for JWT token signing
- **ALLOW_HOSTS**: Comma-separated list of allowed CORS origins

## 🎮 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player123",
  "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "email": "player@example.com",
  "refferal": "optional-referral-code"
}
```

#### Check User by Address
```http
GET /api/auth/check/:address
```

#### Get Current User
```http
GET /api/auth/user
Authorization: Bearer <jwt-token>
```

### Game Endpoints

#### Get Game History
```http
GET /api/game/history
Authorization: Bearer <jwt-token>
```

#### Get Round Information
```http
GET /api/round/:roundId
```

## 🔌 Socket Events

### Game Namespace (`/game`)

#### Client → Server Events

- **`save_history`**: Save game history entry
  ```typescript
  {
    sig: string;
    price: number;
    type: "deposite" | "reward";
    status: "success" | "failed";
    create_at: Date;
    round: number;
    user_id: string;
  }
  ```

- **`get_wager`**: Get user's total wager for current round
  ```typescript
  user_id: string
  ```

#### Server → Client Events

- **`update_round`**: Current round number
- **`update_remain_time`**: Remaining time in seconds
- **`duration_state`**: Whether round duration has started
- **`winner`**: Winner index when round ends
- **`update_total_amout`**: Total bet amount and player list
- **`wager`**: User's total wager for round

### Chat Namespace (`/chat`)

#### Client → Server Events

- **`join`**: Join chat room
  ```typescript
  sender: string // user ID
  ```

- **`message`**: Send chat message
  ```typescript
  {
    content: string;
    sender: string; // user ID
  }
  ```

#### Server → Client Events

- **`message_history`**: Chat message history
- **`new_message`**: New chat message broadcast
- **`user-list`**: List of active users

## 🔗 Smart Contract Integration

The backend integrates with a Solana program (smart contract) built using Anchor framework. Key contract functions:

### Contract Functions

- **`initialize`**: Initialize the game configuration
- **`createGame`**: Create a new game round
- **`joinGame`**: User deposits SOL to join a round
- **`setWinner`**: Admin selects winner based on weighted probability
- **`claimReward`**: Transfer reward to winner
- **`transferFees`**: Transfer platform fees to team wallet

### Contract Interaction Flow

1. **Round Creation**: Backend calls `createGame` to start new round
2. **Deposit Monitoring**: Backend monitors deposits via `depositMonitor`
3. **Timer Start**: When deposits detected, countdown timer begins
4. **Winner Selection**: On timer expiry, backend calls `setWinner`
5. **Reward Distribution**: Backend calls `claimReward` to send SOL to winner
6. **Fee Collection**: Backend calls `transferFees` to collect platform fees

## 🧪 Development

### Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── config/                # Configuration files
├── controllers/           # Request controllers
├── services/              # Business logic services
├── models/                # MongoDB models
├── routes/                # API routes
├── middlewares/           # Express middlewares
├── contract/              # Solana contract integration
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

### Code Style

- TypeScript strict mode enabled
- ES2020 target
- CommonJS modules
- ESLint recommended (if configured)

### Logging

Logs are written to `logs/` directory with daily rotation:
- `combined-YYYY-MM-DD.log`: All logs
- `error-YYYY-MM-DD.log`: Error logs only

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow TypeScript best practices
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the ISC License.

## 🔍 Keywords

**Solana casino game**, **casino game**, **casino**, **Solana jackpot**, **blockchain casino**, **decentralized casino**, **Solana betting**, **crypto casino**, **provably fair casino**, **Solana game backend**, **Web3 casino**, **SOL casino**, **Solana gambling**, **on-chain casino**, **smart contract casino**, **real-time casino**, **jackpot game**, **Solana dApp**, **cryptocurrency casino**

## 📞 Support

For support, email support@solbet.com or open an issue in the GitHub repository.

## 🙏 Acknowledgments

- Solana Foundation for the amazing blockchain platform
- Anchor Framework for simplifying Solana development
- Express.js community for the robust web framework
- MongoDB for the flexible database solution

---

**Built with ❤️ for the Solana ecosystem**

**⭐ Star this repo if you find it helpful!**

