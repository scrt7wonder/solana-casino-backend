import dotenv from "dotenv";
import type cors from 'cors'

dotenv.config();

try {
    dotenv.config();
} catch (error) {
    console.error("Error loading environment variables:", error);
    process.exit(1);
}

export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

/**
 * Initialize Cors
 */
export const corsOptionsHttp: cors.CorsOptions = {
    // Restrict Allowed Origin
    origin: process.env.ALLOW_HOSTS,
    methods: 'OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}

export const corsOptionsSocket = process.env.SOCKET_ALLOW_HOSTS

export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const MONGO_URL = process.env.MONGO_URL;