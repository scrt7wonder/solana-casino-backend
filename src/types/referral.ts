import { Document, Types } from "mongoose";

export interface IReferral extends Document {
    referral: string;
    affiliate: number; // Optional field for affiliate earnings
    count: number;
    user_id: Types.ObjectId;
}