import { Document } from "mongoose";

export interface IMessage extends Document {
    username: string;
    content: string;
    timestamp: Date;
    room: string;
}