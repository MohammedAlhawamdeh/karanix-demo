import { Router } from 'express';
import Joi from 'joi';
import {
  getOperationsHandler,
  getOperationHandler,
  startOperationHandler
} from '../controllers/operationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const operationsRouter = Router();

operationsRouter.get(
  '/',
  validate(
    Joi.object({
      date: Joi.string().isoDate().optional(),
      status: Joi.string().valid('planned', 'active', 'completed').optional()
    }),
    'query'
  ),
  getOperationsHandler
);

operationsRouter.get('/:id', getOperationHandler);

operationsRouter.post('/:id/start', authenticate(['guide', 'driver']), startOperationHandler);
