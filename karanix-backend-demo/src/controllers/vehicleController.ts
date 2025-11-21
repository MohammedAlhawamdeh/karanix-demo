import { Request, Response, NextFunction } from 'express';
import { recordHeartbeat } from '../services/vehicleService';
import { emitVehicleUpdate } from '../sockets/events';

export const heartbeatHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await recordHeartbeat(req.params.id, req.body);
    const operationId =
      (vehicle.operation as any as { id?: string })?.id || vehicle.operation?.toString();
    if (operationId) {
      emitVehicleUpdate(operationId, vehicle);
    }
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};
