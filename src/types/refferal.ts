import { Document, Types } from "mongoose";

export interface IRefferal extends Document {
    refferal: string;
    count: number;
    user_id: Types.ObjectId;
}