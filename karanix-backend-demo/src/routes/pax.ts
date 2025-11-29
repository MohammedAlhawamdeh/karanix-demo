import { Router } from 'express';
import Joi from 'joi';
import { checkInHandler } from '../controllers/paxController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const paxRouter = Router();

paxRouter.post(
  '/:id/checkin',
  authenticate(['guide']),
  validate(
    Joi.object({
      method: Joi.string().valid('qr', 'manual').required(),
      gps: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).optional(),
      photoUrl: Joi.string().uri().optional(),
      eventId: Joi.string().guid({ version: 'uuidv4' }).required()
    })
  ),
  checkInHandler
);
