"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../utils/logger"));
const constants_1 = require("./constants");
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(constants_1.MONGO_URL);
        logger_1.default.info(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        logger_1.default.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    await mongoose_1.default.connection.close();
    logger_1.default.info('MongoDB disconnected');
};
exports.disconnectDB = disconnectDB;
