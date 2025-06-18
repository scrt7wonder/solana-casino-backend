import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger';
import { MONGO_URL } from './constants';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URL);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`Database connection error: ${(error as Error).message}`);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');
};

export { connectDB, disconnectDB };