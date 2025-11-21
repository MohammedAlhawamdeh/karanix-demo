import { Request, Response, NextFunction } from 'express';
import { checkInPax } from '../services/paxService';
import { emitManifestUpdate } from '../sockets/events';

export const checkInHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pax = await checkInPax(req.params.id);
    const opId = (pax.operation as any as { id: string }).id || pax.operation.toString();
    emitManifestUpdate(opId, pax);
    res.json(pax);
  } catch (err) {
    next(err);
  }
};
