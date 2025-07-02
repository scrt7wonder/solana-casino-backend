import { Document } from "mongoose";

export interface ISetting extends Document {
    name: string;
    round: number;
    forceBytes: Buffer;
    randomPda: string;
}