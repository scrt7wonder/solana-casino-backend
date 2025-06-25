"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    user_id: { type: String, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 500 },
    timestamp: { type: Date, default: Date.now },
    room: { type: String, default: 'public', index: true }
});
// Add index for frequently queried fields
MessageSchema.index({ user_id: 1, room: 1, timestamp: -1 });
// Static method for creating messages with population
MessageSchema.statics.createMessage = async function (user_id, content, room = 'public') {
    console.log("🚀 ~ user_id:", user_id);
    const message = new this({ user_id, content, room });
    await message.save();
    console.log("🚀 ~ message:", message);
    return message.populate({
        path: 'user_id',
        select: 'username avatar email'
    });
};
// Auto-populate hook
MessageSchema.post('save', function (doc, next) {
    doc.populate({
        path: 'user_id',
        select: 'username avatar'
    })
        .then(() => next())
        .catch(next);
});
exports.default = (0, mongoose_1.model)('Message', MessageSchema);
