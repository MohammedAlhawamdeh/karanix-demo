import { Request, Response, NextFunction } from 'express';
import { addCustomersToLocation, createLocation, listLocations } from '../services/locationService';

export const createLocationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await createLocation(req.body);
    res.status(201).json(location);
  } catch (err) {
    next(err);
  }
};

export const addCustomersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await addCustomersToLocation(req.params.id, req.body.customerIds || []);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const listLocationsHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await listLocations();
    res.json(locations);
  } catch (err) {
    next(err);
  }
};
