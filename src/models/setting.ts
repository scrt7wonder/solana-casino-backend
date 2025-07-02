import { Schema, model } from 'mongoose';
import { ISetting } from '../types/setting';

const SettingSchema = new Schema<ISetting>({
    name: {type: String, required: true, default: "solbet"},
    round: { type: Number, required: true, default: 1 },
})

export default model<ISetting>('Setting', SettingSchema);