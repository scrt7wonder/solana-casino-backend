import { Schema, model } from 'mongoose';
import { ISetting } from '../types/setting';

const SettingSchema = new Schema<ISetting>({
    name: {type: String, required: false, default: "solbet"},
    round: { type: Number, required: false, default: 1 },
    forceBytes: { type: Buffer, required: false, default: null },
    randomPda: { type: String, required: false, default: null },
    totalAmount: { type: Number, required: false, default: 0 },
})

export default model<ISetting>('Setting', SettingSchema);