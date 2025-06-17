import User from '../models/user';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { IauthUserDto } from '../types/auth.dto';
import Refferal from "../models/refferal";

config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export class AuthService {
    public async auth(userData: IauthUserDto) {
        const { username, address, email, refferal } = userData;
        const saveData = {
            username,
            address,
            email,
            invite_link: `${address}_${username}`,
            refferal
        }

        if (refferal !== "") {
            let refferRes = await Refferal.findOne({ refferal });
            if (refferRes) {
                await Refferal.findOneAndUpdate(
                    { refferal },
                    { $set: { count: refferRes.count + 1 } },
                    { new: true }
                )
            } else {
                const refferUser = await User.findOne({ invite_link: refferal });
                if (refferUser) {
                    refferRes = new Refferal(
                        {
                            refferal,
                            count: 1,
                            user_id: refferUser._id,
                        }
                    )
                    await refferRes.save();
                }
            }
        }

        let user = await User.findOne({ address });
        if (!user) {
            // Create new user
            user = new User(saveData);
            await user.save();

            // Create and return JWT
            const token = this.generateToken(user.id);
            return { token };
        }
    }

    private generateToken(userId: string): string {
        return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
    }
}