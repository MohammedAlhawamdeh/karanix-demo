import { Router } from 'express';
import Joi from 'joi';
import { heartbeatHandler } from '../controllers/vehicleController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const vehiclesRouter = Router();

vehiclesRouter.post(
  '/:id/heartbeat',
  authenticate(['driver']),
  validate(
    Joi.object({
      location: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),
      speed: Joi.number().optional()
    })
  ),
  heartbeatHandler
);
