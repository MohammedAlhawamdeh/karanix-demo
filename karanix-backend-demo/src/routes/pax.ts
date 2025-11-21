import { Router } from 'express';
import { checkInHandler } from '../controllers/paxController';
import { authenticate } from '../middleware/auth';

export const paxRouter = Router();

paxRouter.post('/:id/checkin', authenticate(['guide']), checkInHandler);
