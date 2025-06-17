import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { IauthUserDto } from '../types/auth.dto';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public auth = async (req: Request, res: Response): Promise<Response> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const userData: IauthUserDto = req.body;
            const user = await this.authService.auth(userData);
            return res.status(201).json(user);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    };

    public getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
        try {
            const user = req.user;
            return res.json(user);
        } catch (error) {
            return res.status(500).json({ message: 'Server error' });
        }
    };
}