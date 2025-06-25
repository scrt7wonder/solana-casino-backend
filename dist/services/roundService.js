"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundService = void 0;
const round_1 = __importDefault(require("../models/round"));
class RoundService {
    async saveWinner(round, won, chance, user_id) {
        const saveData = {
            round,
            won,
            chance,
            user_id
        };
        const winner = new round_1.default(saveData);
        await winner.save();
    }
    async getWinner(round) {
        const winner = await round_1.default.findOne({ round })
            .populate({
            path: 'user_id',
            select: 'username avatar email'
        });
        if (winner)
            return winner;
        else
            throw new Error("Failed get winner");
    }
    async getLuck() {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - 1);
        const winner = await round_1.default.find({
            create_at: { $gte: daysAgo }
        }).populate({
            path: 'user_id',
            select: 'username avatar email'
        }).sort({ won: 1 });
        return winner[0];
    }
}
exports.RoundService = RoundService;
