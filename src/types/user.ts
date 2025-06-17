import { Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    address: string;
    email: string;
    refferal: string;
    created_at: Date;
    updated_at: Date;
}