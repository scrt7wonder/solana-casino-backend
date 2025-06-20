import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { HistoryService } from '../services/historyService';
import { IHistory } from '../types/history';
import { Server } from 'socket.io';

export class HistoryController {
    private historyService: HistoryService;

    constructor() {
        this.historyService = new HistoryService();
    }

    public saveHistory = async (req: Request, res: Response): Promise<Response> => {
        try {
            const historyData: IHistory = req.body;
            const history = await this.historyService.saveHistory(historyData);
            return res.status(201).json(history);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    };

    public getHistory = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const history = await this.historyService.getHistory(id);
            return res.status(201).json(history);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    };

    public getChartData = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const ohlc = await this.historyService.getChartData(id);
            return res.json(ohlc);
        } catch (error) {
            return res.status(500).json({ message: 'Server error' });
        }
    };
}