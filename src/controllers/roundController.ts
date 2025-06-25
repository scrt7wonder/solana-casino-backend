import { Request, Response } from 'express';
import { RoundService } from "../services/roundService";

export class RoundController {
    private roundService: RoundService;

    constructor() {
        this.roundService = new RoundService();
    }

    public getWinner = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { round } = req.params;
            const winner = await this.roundService.getWinner(Number(round));
            return res.status(201).json(winner);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    };

    public getLuck = async (req: Request, res: Response): Promise<Response> => {
        try {
            const winner = await this.roundService.getLuck();
            return res.status(201).json(winner);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    };
}