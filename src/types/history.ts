import { Document, ObjectId } from "mongoose";

export interface IHistory extends Document {
    sig: string;
    price: number;
    type: string;
    status: string;
    create_at: Date;
    round: number;
    user_id: ObjectId;
}

export interface IntervalResult {
    open: number;
    close: number;
    high: number;
    low: number;
    date: string;
}