import { Router } from 'express';
import { check } from 'express-validator';
import { HistoryController } from '../controllers/historyController';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const historyController = new HistoryController();

// @route   GET /api/game/history/:address
// @desc    get transaction
// @access  Public

router.get(
    '/history/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await historyController.getHistory(req, res);
        } catch (err) {
            next(err);
        }
    }
);

// @route   GET /api/game/ohlc
// @desc    get transaction
// @access  Public

router.get(
    '/ohlc',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await historyController.getChartData(req, res);
        } catch (err) {
            next(err);
        }
    }
);

export default router;