import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { badRequest } from '../utils/httpErrors';

export const validate =
  (schema: ObjectSchema, property: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) return next(badRequest('Validation error', error.details));
    if (property === 'query') {
      Object.assign(req.query, value);
    } else {
      (req as any)[property] = value;
    }
    return next();
  };
