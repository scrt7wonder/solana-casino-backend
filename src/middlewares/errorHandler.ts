import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/errors';

export const errorHandler = (
    err: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';

    res.status(status).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {},
    });
};