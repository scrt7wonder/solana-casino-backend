"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VAULT_SEED = exports.ROUND_SEED = exports.CONFIG_SEED = exports.ROUND_DURATION = exports.PLATFORM_FEE = exports.teamWallet = exports.CLUSTER = exports.ALLOW_HOSTS = exports.MONGO_URL = exports.IS_PRODUCTION = exports.NODE_ENV = exports.JWT_SECRET = exports.adminKP = exports.ADMIN = exports.connection = exports.RPC_ENDPOINT = exports.corsOptionsSocket = exports.corsOptionsHttp = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const web3_js_1 = require("@solana/web3.js");
const bytes_1 = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
dotenv_1.default.config();
try {
    dotenv_1.default.config();
}
catch (error) {
    console.error("Error loading environment variables:", error);
    process.exit(1);
}
exports.PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
/**
 * Initialize Cors
 */
exports.corsOptionsHttp = {
    // Restrict Allowed Origin
    origin: process.env.ALLOW_HOSTS,
    methods: 'OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
exports.corsOptionsSocket = process.env.SOCKET_ALLOW_HOSTS || 'http://localhost:3000';
exports.RPC_ENDPOINT = process.env.RPC_ENDPOINT || "";
exports.connection = new web3_js_1.Connection(exports.RPC_ENDPOINT, "confirmed");
exports.ADMIN = process.env.ADMIN || "";
exports.adminKP = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(exports.ADMIN));
exports.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.IS_PRODUCTION = exports.NODE_ENV === 'production';
exports.MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/solbet';
exports.ALLOW_HOSTS = process.env.ALLOW_HOSTS || "http://localhost:3000";
exports.CLUSTER = process.env.CLUSTER || "";
const TEAM_WALLET = process.env.TEAM_WALLET || "6fqaR9EfVoeWounR9psLmgQ1Jr3y43GbLMHGvWDyGMvH";
exports.teamWallet = new web3_js_1.PublicKey(TEAM_WALLET);
exports.PLATFORM_FEE = Number(process.env.PLATFORM_FEE) || 0;
exports.ROUND_DURATION = Number(process.env.ROUND_DURATION) || 0;
exports.CONFIG_SEED = Buffer.from("globalconfig");
exports.ROUND_SEED = Buffer.from("gameround");
exports.VAULT_SEED = Buffer.from("globlevault");
