import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { RoundController } from '../controllers/roundController';

const router = Router();

const roundController = new RoundController();

// @route   GET /api/round/winner/:round
// @desc    get winner
// @access  Public

router.get(
    '/winner/:round',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await roundController.getWinner(req, res);
        } catch (err) {
            next(err);
        }
    }
);

// @route   GET /api/round/luck
// @desc    get winner
// @access  Public

router.get(
    '/luck',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await roundController.getLuck(req, res);
        } catch (err) {
            next(err);
        }
    }
);

export default router;