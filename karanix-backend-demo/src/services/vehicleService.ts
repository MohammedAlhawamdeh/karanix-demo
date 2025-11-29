import { isValidObjectId } from 'mongoose';
import { Vehicle, IVehicle } from '../models/Vehicle';
import { badRequest, notFound } from '../utils/httpErrors';

interface HeartbeatPayload {
  location: { lat: number; lng: number };
  speed?: number;
  heading?: number;
  timestamp?: string;
}

export const recordHeartbeat = async (
  id: string,
  payload: HeartbeatPayload
): Promise<IVehicle> => {
  if (!isValidObjectId(id)) throw badRequest('Invalid vehicle id');
  const vehicle = await Vehicle.findById(id).populate('operation').exec();
  if (!vehicle) throw notFound('Vehicle not found');

  const ping = {
    location: payload.location,
    speed: payload.speed,
    heading: payload.heading,
    recordedAt: payload.timestamp ? new Date(payload.timestamp) : new Date()
  };

  vehicle.lastPing = ping;
  vehicle.pingHistory.push(ping);
  await vehicle.save();
  return vehicle;
};

export const listVehicles = () => Vehicle.find().populate('operation');
