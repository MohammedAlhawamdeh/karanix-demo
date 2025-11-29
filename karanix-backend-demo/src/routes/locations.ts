import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  addCustomersHandler,
  createLocationHandler,
  listLocationsHandler
} from '../controllers/locationController';

export const locationsRouter = Router();

locationsRouter.use(authenticate());

locationsRouter.get('/', listLocationsHandler);

locationsRouter.post(
  '/',
  validate(
    Joi.object({
      name: Joi.string().required(),
      coordinates: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),
      customerIds: Joi.array().items(Joi.string().optional()).optional()
    })
  ),
  createLocationHandler
);

locationsRouter.post(
  '/:id/customers',
  validate(
    Joi.object({
      customerIds: Joi.array().items(Joi.string().required()).min(1).required()
    })
  ),
  addCustomersHandler
);
