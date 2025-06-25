"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundController = void 0;
const roundService_1 = require("../services/roundService");
class RoundController {
    constructor() {
        this.getWinner = async (req, res) => {
            try {
                const { round } = req.params;
                const winner = await this.roundService.getWinner(Number(round));
                return res.status(201).json(winner);
            }
            catch (error) {
                return res.status(400).json({ message: error.message });
            }
        };
        this.getLuck = async (req, res) => {
            try {
                const winner = await this.roundService.getLuck();
                return res.status(201).json(winner);
            }
            catch (error) {
                return res.status(400).json({ message: error.message });
            }
        };
        this.roundService = new roundService_1.RoundService();
    }
}
exports.RoundController = RoundController;
