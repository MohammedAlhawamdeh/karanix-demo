import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpErrors';

// Central error handler keeps responses consistent.
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err instanceof HttpError ? err.status : 500;
  res.status(status).json({
    message: err.message || 'Unexpected error',
    details: err instanceof HttpError ? err.details : undefined
  });
};
