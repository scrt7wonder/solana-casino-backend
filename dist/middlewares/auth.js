"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const constants_1 = require("../config/constants");
const authMiddleware = async (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');
    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    // Verify token
    try {
        const decoded = jsonwebtoken_1.default.verify(token, constants_1.JWT_SECRET);
        const user = await user_1.default.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ msg: 'Token is not valid' });
        }
        req.user = user; // Assign the user to the extended Request object
        next();
    }
    catch (err) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};
exports.authMiddleware = authMiddleware;
