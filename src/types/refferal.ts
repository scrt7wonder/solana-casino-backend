import { Document, Types } from "mongoose";

export interface IRefferal extends Document {
    refferal: string;
    affiliate?: number; // Optional field for affiliate earnings
    count: number;
    user_id: Types.ObjectId;
}