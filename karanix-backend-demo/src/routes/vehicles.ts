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
      }).optional(),
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
      speed: Joi.number().optional(),
      heading: Joi.number().optional(),
      timestamp: Joi.date().iso().optional()
    }).custom((value, helpers) => {
      if (value.location) return value;
      if (typeof value.lat === 'number' && typeof value.lng === 'number') return value;
      return helpers.error('any.invalid');
    })
  ),
  heartbeatHandler
);
