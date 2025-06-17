import { Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    avatar: string;
    address: string;
    email: string;
    refferal: string;
    invite_link: string;
    created_at: Date;
    updated_at: Date;
}