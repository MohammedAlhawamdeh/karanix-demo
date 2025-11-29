import { Request, Response, NextFunction } from 'express';
import { checkInPax } from '../services/paxService';
import { emitManifestUpdate } from '../sockets/events';

export const checkInHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await checkInPax(req.params.id, req.body);
    const opId =
      (result.doc.operation as any as { id: string }).id || result.doc.operation.toString();
    emitManifestUpdate(opId, result.doc, result.checkedInCount);
    res.json(result.doc);
  } catch (err) {
    next(err);
  }
};
