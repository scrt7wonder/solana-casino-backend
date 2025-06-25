"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    avatar: {
        type: String,
        required: true,
        default: "9fddb4e7b9f48a521886e34bd22474b9ae8da2665a6983b2923f5a3a6e60d81b.jpeg"
    },
    address: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    invite_link: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    refferal: {
        type: String,
        required: false,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});
exports.default = (0, mongoose_1.model)('User', UserSchema);
