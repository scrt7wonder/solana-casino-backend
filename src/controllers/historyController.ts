import { Request, Response } from 'express';
import { HistoryService } from '../services/historyService';
import mongoose from 'mongoose';

export class HistoryController {
    private historyService: HistoryService;

    constructor() {
        this.historyService = new HistoryService();
    }

    public getHistory = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id, page } = req.body;
            const history = await this.historyService.getHistory(id, page);
            return res.status(201).json(history);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    };

    public getChartData = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id, date } = req.body;
            const durationData = await this.historyService.getChartData(id, date);
            return res.json(durationData);
        } catch (error) {
            return res.status(500).json({ message: 'Server error' });
        }
    };
}