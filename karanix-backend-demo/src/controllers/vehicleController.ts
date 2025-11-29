import { Request, Response, NextFunction } from 'express';
import { recordHeartbeat } from '../services/vehicleService';
import { emitVehicleUpdate } from '../sockets/events';

export const heartbeatHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location =
      req.body.location ||
      (typeof req.body.lat === 'number' && typeof req.body.lng === 'number'
        ? { lat: req.body.lat, lng: req.body.lng }
        : undefined);
    const vehicle = await recordHeartbeat(req.params.id, {
      location: location as any,
      speed: req.body.speed,
      heading: req.body.heading,
      timestamp: req.body.timestamp
    });
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
