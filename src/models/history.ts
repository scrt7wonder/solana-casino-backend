import { Schema, model } from 'mongoose';
import { IHistory } from '../types/history';

const HistorySchema = new Schema<IHistory>({
    sig: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    type: { type: String, required: true },
    status: { type: String, required: true },
    create_at: { type: Date, requried: true },
    round: { type: Number, required: true },
    profit: { type: Number, default: 0 }, // Default profit to 0
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
});

export default model<IHistory>('History', HistorySchema);