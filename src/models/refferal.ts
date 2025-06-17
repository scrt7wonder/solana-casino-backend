import { Schema, model } from 'mongoose';
import { IRefferal } from '../types/refferal';

const RefferalSchema = new Schema<IRefferal>({
    refferal_link: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
});

export default model<IRefferal>('Refferal', RefferalSchema);