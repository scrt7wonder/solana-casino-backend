"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const constants_1 = require("../config/constants");
const { combine, timestamp, printf, colorize, align, errors } = winston_1.default.format;
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Set level based on environment
const level = () => {
    return constants_1.IS_PRODUCTION ? 'info' : 'debug';
};
// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
// Custom log format
const logFormat = combine(errors({ stack: true }), // <-- Add this to log stack traces
timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), printf((info) => {
    const { timestamp, level, message, stack, ...args } = info;
    // Format the log message
    let log = `${timestamp} [${level}]: ${message}`;
    // Add stack trace if available
    if (stack) {
        log += `\n${stack}`;
    }
    // Add additional metadata if present
    if (Object.keys(args).length > 0) {
        log += ` ${JSON.stringify(args, null, 2)}`;
    }
    return log;
}), align());
// Console transport (colored output)
const consoleTransport = new winston_1.default.transports.Console({
    format: combine(colorize({ all: true }), logFormat),
    level: 'debug', // Always show all levels in console
});
// File transports (rotated daily)
const fileTransports = [
    new winston_daily_rotate_file_1.default({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: logFormat,
    }),
    new winston_daily_rotate_file_1.default({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: logFormat,
    }),
];
// Create the logger
const logger = winston_1.default.createLogger({
    level: level(),
    levels,
    defaultMeta: { service: 'solbet-backend', NODE_ENV: constants_1.NODE_ENV },
    transports: [
        consoleTransport,
        ...(constants_1.IS_PRODUCTION ? fileTransports : []),
    ],
    exitOnError: false,
});
exports.default = logger;
