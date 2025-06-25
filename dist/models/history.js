"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const HistorySchema = new mongoose_1.Schema({
    sig: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    type: { type: String, required: true },
    status: { type: String, required: true },
    create_at: { type: Date, requried: true },
    round: { type: Number, required: true },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
});
exports.default = (0, mongoose_1.model)('History', HistorySchema);
