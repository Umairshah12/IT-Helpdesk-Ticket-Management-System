import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export const authorize = (allowedRoles: Array<'SUPER_ADMIN' | 'ADMIN' | 'TECHNICIAN' | 'EMPLOYEE'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated user.', 'UNAUTHORIZED', undefined, 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access denied. Requires one of [${allowedRoles.join(', ')}] permissions.`,
        'FORBIDDEN',
        undefined,
        403
      );
    }

    next();
  };
};

