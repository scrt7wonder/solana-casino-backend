import { Document, ObjectId } from "mongoose";

export interface IRound extends Document {
    round: number;
    won: number;
    chance: number;
    user_id: ObjectId;
    create_at: Date;
}

export interface IWaiting {
    _id: string
    round: number;
    won: number;
    chance: number;
    user_id: {
        _id: string;
        username: string;
        avatar: string;
        created_at: Date;
    };
    create_at: Date;
}