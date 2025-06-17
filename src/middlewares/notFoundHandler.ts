import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/errors';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new HttpException(404, `Not Found - ${req.originalUrl}`);
    next(error);
};