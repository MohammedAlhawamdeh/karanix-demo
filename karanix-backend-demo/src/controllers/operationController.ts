import { Request, Response, NextFunction } from 'express';
import { listOperations, getOperation, startOperation } from '../services/operationService';
import { emitOperationStart } from '../sockets/events';

export const getOperationsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, status } = req.query;
    const operations = await listOperations({
      date: date as string | undefined,
      status: status as any
    });
    res.json(operations);
  } catch (err) {
    next(err);
  }
};

export const getOperationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const op = await getOperation(req.params.id);
    res.json(op);
  } catch (err) {
    next(err);
  }
};

export const startOperationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const op = await startOperation(req.params.id);
    emitOperationStart(op.id);
    res.json(op);
  } catch (err) {
    next(err);
  }
};
