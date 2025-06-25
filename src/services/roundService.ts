import Round from "../models/round"
import { IRound, IWaiting } from "../types/round";

export class RoundService {
    public async saveWinner(round: number, won: number, chance: number, user_id: string) {
        const saveData = {
            round,
            won,
            chance,
            user_id
        }

        const winner = new Round(saveData);
        await winner.save();
    }

    public async getWinner(round: number): Promise<IRound> {
        const winner = await Round.findOne({ round })
            .populate({
                path: 'user_id',
                select: 'username avatar email'
            });

        if (winner)
            return winner
        else throw new Error("Failed get winner")
    }

    public async getLuck(): Promise<IRound> {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - 1);

        const winner = await Round.find({
            create_at: { $gte: daysAgo }
        }).populate({
            path: 'user_id',
            select: 'username avatar email'
        }).sort({ won: 1 });

        return winner[0];
    }
}