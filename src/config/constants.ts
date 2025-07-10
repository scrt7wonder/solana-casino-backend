import dotenv from "dotenv";
import type cors from 'cors'
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

dotenv.config();

try {
    dotenv.config();
} catch (error) {
    console.error("Error loading environment variables:", error);
    process.exit(1);
}

export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

/**
 * Initialize Cors
 */
export const corsOptionsHttp: cors.CorsOptions = {
    // Restrict Allowed Origin
    origin: process.env.ALLOW_HOSTS,
    methods: 'OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}

export const corsOptionsSocket = process.env.SOCKET_ALLOW_HOSTS || 'http://localhost:3000'

export const RPC_ENDPOINT = process.env.RPC_ENDPOINT || "";

export const connection = new Connection(
    RPC_ENDPOINT,
    "confirmed"
)

export const ADMIN = process.env.ADMIN || "";
export const adminKP = Keypair.fromSecretKey(bs58.decode(ADMIN));

export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/solbet';
export const ALLOW_HOSTS = process.env.ALLOW_HOSTS || "http://localhost:3000";

export const CLUSTER = process.env.CLUSTER || "";
const TEAM_WALLET = process.env.TEAM_WALLET || "6fqaR9EfVoeWounR9psLmgQ1Jr3y43GbLMHGvWDyGMvH";
export const teamWallet = new PublicKey(TEAM_WALLET);
export const PLATFORM_FEE = Number(process.env.PLATFORM_FEE) || 0;
export const AFFILIATE_FEE = Number(process.env.AFFILIATE_FEE) || 0;
export const ROUND_DURATION = Number(process.env.ROUND_DURATION) || 0;

export const CONFIG_SEED = Buffer.from("globalconfig");
export const ROUND_SEED = Buffer.from("gameround");
export const VAULT_SEED = Buffer.from("globlevault");