import { Router } from 'express';
import { check } from 'express-validator';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const authController = new AuthController();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
interface AuthRequestBody {
    username: string;
    address: string;
    email: string;
}

router.post(
    '/auth',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('address', 'Address is required').not().isEmpty(),
        check('email', 'Email is required').not().isEmpty(),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authController.auth(req, res);
        } catch (err) {
            next(err);
        }
    }
);

// @route   GET /api/auth/user
// @desc    Get current user
// @access  Private
router.get('/user', async (req, res, next) => { await authMiddleware(req, res, next) }, async (req, res, next) => {
    try {
        await authController.getCurrentUser(req, res);
        return;
    } catch (err) {
        next(err);
    }
});

export default router;