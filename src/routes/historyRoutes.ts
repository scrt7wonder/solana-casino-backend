import { Router } from 'express';
import { HistoryController } from '../controllers/historyController';
import { Request, Response, NextFunction } from 'express';

const router = Router();

const historyController = new HistoryController();

// @route   POST /api/game/history
// @desc    get transaction
// @access  Public

router.post(
    '/history',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await historyController.getHistory(req, res);
        } catch (err) {
            next(err);
        }
    }
);

// @route   POST /api/game/ohlc
// @desc    get transaction
// @access  Public

router.post(
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