import User from '../models/user';
import { IUser } from '../types/user';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { RegisterUserDto } from '../types/auth.dto';
import Refferal from "../models/refferal";

config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export class AuthService {
    public async auth(userData: RegisterUserDto) {
        const { address, refferal } = userData;

        let user = await User.findOne({ address });
        if (!user) {
            // Create new user
            user = new User(userData);
            await user.save();
    
            // Create and return JWT
            const token = this.generateToken(user.id);
            return { token };
        }

        if (refferal !== "") {
            const refferRes = await Refferal.findOne({ refferal});

        }


    }

    private generateToken(userId: string): string {
        return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
    }
}