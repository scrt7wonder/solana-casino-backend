import { Schema, model } from 'mongoose';
import { ISetting } from '../types/setting';

const SettingSchema = new Schema<ISetting>({
    name: {type: String, required: true, default: "solbet"},
    round: { type: Number, required: true, default: 1 },
    forceBytes: { type: Buffer, required: false, default: null },
    randomPda: { type: String, required: false, default: null }
})

export default model<ISetting>('Setting', SettingSchema);