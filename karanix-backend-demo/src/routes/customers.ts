import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCustomerHandler, listCustomersHandler } from '../controllers/customerController';

export const customersRouter = Router();

customersRouter.use(authenticate());

customersRouter.get('/', listCustomersHandler);

customersRouter.post(
  '/',
  validate(
    Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().optional(),
      email: Joi.string().email().optional(),
      pickupPoint: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
        address: Joi.string().optional()
      }).optional(),
      notes: Joi.string().optional(),
      locationId: Joi.string().optional()
    })
  ),
  createCustomerHandler
);
