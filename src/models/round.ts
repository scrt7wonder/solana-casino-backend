import { Schema, model } from 'mongoose';
import { IRound } from '../types/round';

const RoundSchema = new Schema<IRound>({
    round: { type: Number, required: true, unique: true },
    won: { type: Number, required: true },
    chance: { type: Number, required: true },
    create_at: { type: Date, required: true, default: Date.now },
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
})

export default model<IRound>('Round', RoundSchema);