import { Document, Types } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    avatar: string;
    address: string;
    email: string;
    refferal: string;
    invite_link: string;
    created_at: Date;
    updated_at: Date;
}