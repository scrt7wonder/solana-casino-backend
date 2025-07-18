import User from '../models/user';
import Referral from "../models/referral";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';
import { IauthUserDto } from '../types/auth.dto';
import { IUser } from '../types/user';

export class AuthService {
    public async auth(userData: IauthUserDto): Promise<{ token: string, user: IUser, number: number }> {
        const { username, address, email, referral } = userData;
        const saveData: any = {
            username,
            address,
            email,
            invite_link: `${address}_${username}`,
            referral
        }

        if (referral !== "") {
            saveData.deposit_state = false;
            let refferRes = await Referral.findOne({ referral });
            if (refferRes) {
                await Referral.findOneAndUpdate(
                    { referral },
                    { $set: { count: refferRes.count + 1, affiliate: refferRes.affiliate + 10 } },
                    { new: true }
                )
            } else {
                const refferUser = await User.findOne({ invite_link: referral });
                if (refferUser) {
                    refferRes = new Referral(
                        {
                            referral,
                            affiliate: 10,
                            count: 1,
                            user_id: refferUser._id,
                        }
                    )
                    await refferRes.save();
                }
            }
        } else {
            saveData.deposit_state = true;
        }

        // Create new user
        const user = new User(saveData);
        await user.save();

        const users = await User.find({ online: true });
        const number = users.length;

        // Create and return JWT
        const token = this.generateToken(user._id.toString());
        return { token, user, number };
    }

    public async updateAuth(id: string, updateData: any): Promise<IUser> {
        return await User.findOneAndUpdate(
            { _id: id },
            { $set: updateData },
            { new: true, upsert: true }
        )
    }

    public async check(address: string): Promise<{ token: string, user: IUser, number: number } | boolean> {
        const user = await User.findOne({ address });
        if (!user) {
            return false;
        } else {
            // Create and return JWT
            const token = this.generateToken(user._id.toString());
            const users = await User.find({ online: true });
            const number = users.length;

            return { token, user, number }
        }
    }

    public async getOnlineUsers(id: string, updateData: any): Promise<{ user: IUser, number: number }> {
        const user = await User.findOneAndUpdate(
            { _id: id },
            { $set: updateData },
            { new: true, upsert: true }
        ) as IUser;

        const users = await User.find({ online: true });
        const number = users.length;
        return { user, number }
    }

    private generateToken(userId: string): string {
        return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
    }
}