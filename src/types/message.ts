import { Document, Types } from "mongoose";
import { IUser } from "./user";

export interface IMessage extends Document {
    user_id: string;
    content: string;
    timestamp: Date;
    room: string;
}

export interface IMessagePopulated extends Omit<IMessage, 'user_id'> {
    user_id: IUser;
}