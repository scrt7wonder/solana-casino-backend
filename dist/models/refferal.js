"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RefferalSchema = new mongoose_1.Schema({
    refferal: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
});
exports.default = (0, mongoose_1.model)('Refferal', RefferalSchema);
