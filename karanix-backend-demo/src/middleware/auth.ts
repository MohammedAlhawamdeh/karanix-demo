import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRole } from '../models/User';
import { unauthorized, forbidden } from '../utils/httpErrors';

export interface AuthPayload {
  userId: string;
  role: UserRole;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthPayload;
  }
}

export const authenticate =
  (roles?: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next(unauthorized('Missing token'));
    }

    const token = header.split(' ')[1];
    try {
      const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
      if (roles && !roles.includes(payload.role)) {
        return next(forbidden('Insufficient role'));
      }
      req.user = payload;
      return next();
    } catch {
      return next(unauthorized('Invalid token'));
    }
  };
