import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { NODE_ENV, IS_PRODUCTION } from '../config/constants';

const { combine, timestamp, printf, colorize, align, errors } = winston.format;

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
    return IS_PRODUCTION ? 'info' : 'debug';
};

// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston.addColors(colors);

// Custom log format
const logFormat = combine(
    errors({ stack: true }), // <-- Add this to log stack traces
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    printf((info) => {
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
    }),
    align()
);

// Console transport (colored output)
const consoleTransport = new winston.transports.Console({
    format: combine(
        colorize({ all: true }),
        logFormat
    ),
    level: 'debug', // Always show all levels in console
});

// File transports (rotated daily)
const fileTransports = [
    new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: logFormat,
    }),
    new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: logFormat,
    }),
];

// Create the logger
const logger = winston.createLogger({
    level: level(),
    levels,
    defaultMeta: { service: 'solbet-backend', NODE_ENV },
    transports: [
        consoleTransport,
        ...(IS_PRODUCTION ? fileTransports : []),
    ],
    exitOnError: false,
});


export default logger;