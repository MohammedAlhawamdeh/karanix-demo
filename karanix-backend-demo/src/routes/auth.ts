import { Router } from 'express';
import Joi from 'joi';
import { loginHandler } from '../controllers/authController';
import { validate } from '../middleware/validate';

export const authRouter = Router();

authRouter.post(
  '/login',
  validate(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  ),
  loginHandler
);
