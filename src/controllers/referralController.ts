import { Request, Response } from 'express';
import { ReferralService } from '../services/referralService';
import { HistoryService } from '../services/historyService';

export class ReferralController {
    private referralService: ReferralService;
    private historyService: HistoryService;

    constructor() {
        this.referralService = new ReferralService();
        this.historyService = new HistoryService();
    }

    public getReferralUsers = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { userId, referral, date } = req.body;
            const users = await this.referralService.getReferralUsers(referral);
            const data = await this.historyService.getAffiliate(userId, date);
            return res.status(201).json({users: users.length, duringEarn: data.duringEarn, earn: data.earn});
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    };

    public getState = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { referral } = req.body;
            const state = await this.referralService.checkAffiliate(referral);
            return res.status(201).json({state});
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    };

    public updateAffiliate = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { referral, count, amount } = req.body;
            const state = await this.referralService.updateAffiliate(referral, amount, count);
            return res.status(201).json({state});
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    };
}