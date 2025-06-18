import mongoose, { model, Schema, Types } from "mongoose";
import { IMessage, IMessagePopulated } from "../types/message";

const MessageSchema = new Schema<IMessage>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, trim: true, maxlength: 500 },
  timestamp: { type: Date, default: Date.now },
  room: { type: String, default: 'public', index: true }
});

// Add index for frequently queried fields
MessageSchema.index({ user_id: 1, room: 1, timestamp: -1 });

// Static method for creating messages with population
MessageSchema.statics.createMessage = async function (
  user_id: Types.ObjectId,
  content: string,
  room: string = 'public'
): Promise<IMessagePopulated> {
  const message = new this({ user_id, content, room });
  await message.save();
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

interface MessageModel extends mongoose.Model<IMessage> {
  createMessage: (
    user_id: Types.ObjectId,
    content: string,
    room?: string
  ) => Promise<IMessagePopulated>;
}

export default model<IMessage, MessageModel>('Message', MessageSchema);