"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    res.status(status).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {},
    });
};
exports.errorHandler = errorHandler;
