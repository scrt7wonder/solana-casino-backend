"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RoundSchema = new mongoose_1.Schema({
    round: { type: Number, required: true, unique: true },
    won: { type: Number, required: true },
    chance: { type: Number, required: true },
    create_at: { type: Date, required: true, default: Date.now },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
});
exports.default = (0, mongoose_1.model)('Round', RoundSchema);
