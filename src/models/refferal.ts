import { Schema, model } from 'mongoose';
import { IRefferal } from '../types/refferal';

const RefferalSchema = new Schema<IRefferal>({
    refferal: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
});

export default model<IRefferal>('Refferal', RefferalSchema);