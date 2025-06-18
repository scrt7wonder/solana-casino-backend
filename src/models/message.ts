import { model, Schema } from "mongoose";
import { IMessage } from "../types/message";

const MessageSchema = new Schema<IMessage>({
  username: { type: String, required: true, trim: true, maxlength: 30 },
  content: { type: String, required: true, trim: true, maxlength: 500 },
  timestamp: { type: Date, default: Date.now },
  room: { type: String, default: 'public', index: true }
});

export default model<IMessage>('Message', MessageSchema);