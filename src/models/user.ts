import { Schema, model } from 'mongoose';
import { IUser } from '../types/user';

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    avatar: {
        type: String,
        required: true,
        default: "https://ipfs.io/ipfs/QmTKQmu1xykpcK1GbAGkeZuq4MgsVsAw8GvpEcqm8Kvs8r"
    },
    address: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    invite_link: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    referral: {
        type: String,
        required: false,
        trim: true,
        default: ""
    },
    deposit_state: {
        type: Boolean,
        required: true,
    },
    online: {
        type: Boolean,
        required: false,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

export default model<IUser>('User', UserSchema);