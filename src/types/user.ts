import { Document, Types } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    avatar: string;
    address: string;
    email: string;
    referral: string;
    deposit_state: boolean,
    invite_link: string;
    online: boolean;
    created_at: Date;
    updated_at: Date;
}