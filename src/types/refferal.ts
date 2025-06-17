import { Document } from "mongoose";

export interface IRefferal extends Document {
    refferal_link: string;
    count: number;
}