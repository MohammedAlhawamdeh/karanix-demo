import { isValidObjectId } from 'mongoose';
import { Pax, IPax } from '../models/Pax';
import { CheckInEvent } from '../models/CheckInEvent';
import { badRequest, notFound } from '../utils/httpErrors';
import { setOperationCheckInCounts } from './operationService';

interface CheckInPayload {
  method: 'qr' | 'manual';
  gps?: { lat: number; lng: number };
  photoUrl?: string;
  eventId: string;
}

const computeCounts = async (operationId: string) => {
  const [totalPax, checkedInCount] = await Promise.all([
    Pax.countDocuments({ operation: operationId }),
    Pax.countDocuments({ operation: operationId, checkedIn: true })
  ]);
  await setOperationCheckInCounts(operationId, totalPax, checkedInCount);
  return { totalPax, checkedInCount };
};

export const checkInPax = async (
  id: string,
  payload: CheckInPayload
): Promise<{ doc: IPax; checkedInCount: number }> => {
  if (!isValidObjectId(id)) throw badRequest('Invalid pax id');

  const existing = await CheckInEvent.findOne({ eventId: payload.eventId }).exec();
  if (existing) {
    const paxDoc = await Pax.findById(existing.pax).populate('operation').exec();
    if (!paxDoc) throw notFound('Passenger not found');
    const operationId =
      (paxDoc.operation as any)._id?.toString() || (paxDoc.operation as any).toString();
    const counts = await computeCounts(operationId);
    return { doc: paxDoc, checkedInCount: counts.checkedInCount };
  }

  const pax = await Pax.findById(id).populate('operation').exec();
  if (!pax) throw notFound('Passenger not found');

  const operationId =
    (pax.operation as any)._id?.toString() || (pax.operation as any).toString();

  pax.checkedIn = true;
  pax.status = 'checked_in';
  pax.checkInTime = new Date();
  await pax.save();

  await CheckInEvent.create({
    eventId: payload.eventId,
    pax: pax._id,
    operation: operationId,
    method: payload.method,
    gps: payload.gps,
    photoUrl: payload.photoUrl
  });

  const counts = await computeCounts(operationId);
  return { doc: pax, checkedInCount: counts.checkedInCount };
};

export const listPaxForOperation = async (operationId: string) => Pax.find({ operation: operationId });
