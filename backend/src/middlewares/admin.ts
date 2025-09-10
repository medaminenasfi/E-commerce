import { Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../utils/errors';
import { AuthenticatedRequest } from './auth';

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            error: {
                code: 'FORBIDDEN_ERROR',
                message: 'Admin access required',
            },
        });
    }
    next();
};
