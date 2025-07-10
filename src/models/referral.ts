import { Schema, model } from 'mongoose';
import { IReferral } from '../types/referral';

const referralSchema = new Schema<IReferral>({
    referral: { type: String, required: true, unique: true },
    affiliate: { type: Number, required: true, default: 0 },
    count: { type: Number, default: 0 },
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
});

export default model<IReferral>('referral', referralSchema);