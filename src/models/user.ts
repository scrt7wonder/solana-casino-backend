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
        default: "/images/avatars/9fddb4e7b9f48a521886e34bd22474b9ae8da2665a6983b2923f5a3a6e60d81b.jpeg"
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
    refferal: {
        type: String,
        required: false,
        trim: true
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