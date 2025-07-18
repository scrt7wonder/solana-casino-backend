import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { ReferralController } from '../controllers/referralController';

const router = Router();

const referralController = new ReferralController();

// @route   POST /api/referral/
// @desc    get affiliate state
// @access  Public

router.post(
    '/',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await referralController.getReferralUsers(req, res);
        } catch (err) {
            next(err);
        }
    }
);

// @route   POST /api/referral/affiliate
// @desc    get affiliate state
// @access  Public

router.post(
    '/affiliate',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await referralController.getState(req, res);
        } catch (err) {
            next(err);
        }
    }
);

// @route   POST /api/referral/update
// @desc    get updated affiliate state
// @access  Public

router.post(
    '/update',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await referralController.updateAffiliate(req, res);
        } catch (err) {
            next(err);
        }
    }
);

export default router;