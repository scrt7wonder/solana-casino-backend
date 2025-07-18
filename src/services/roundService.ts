import History from "../models/history";
import Round from "../models/round"
import { IRound } from "../types/round";

export class RoundService {
    public async saveWinner(round: number, won: number, chance: number, user_id: string) {
        const saveData = {
            round,
            won,
            chance,
            user_id
        }

        const winner = await Round.findOne({ round });
        if (winner) {
            await Round.findOneAndUpdate(
                { round },
                { $set: { saveData } },
                { new: true, upsert: true }
            );
        } else {
            const newwinner = new Round(saveData);
            await newwinner.save();
        }
    }

    public async getWinner(round: number): Promise<IRound> {
        const winner = await Round.findOne({ round })
            .populate({
                path: 'user_id',
                select: 'username avatar email created_at'
            });

        if (winner)
            return winner
        else throw new Error("Failed get winner")
    }

    public async getLuck(): Promise<IRound> {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - 1);

        const luckiest = await History.find({
            type: "reward",
            create_at: { $gte: daysAgo }
        }).sort({ profit: -1 }).limit(1);
        const luckiestWin = luckiest.length > 0 ? luckiest[0].round : 0;
        console.log("🚀 ~ RoundService ~ getLuck ~ luckiest:", luckiestWin)

        const winner = await Round.find({
            round: luckiestWin
        }).populate({
            path: 'user_id',
            select: 'username avatar email created_at'
        }).sort({ chance: -1 });

        return winner[0];
    }
}