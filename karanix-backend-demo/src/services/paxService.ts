import { isValidObjectId } from 'mongoose';
import { Pax, IPax } from '../models/Pax';
import { badRequest, notFound } from '../utils/httpErrors';

export const checkInPax = async (id: string): Promise<IPax> => {
  if (!isValidObjectId(id)) throw badRequest('Invalid pax id');

  const pax = await Pax.findById(id).populate('operation').exec();
  if (!pax) throw notFound('Passenger not found');

  pax.checkedIn = true;
  pax.checkInTime = new Date();
  await pax.save();
  return pax;
};

export const listPaxForOperation = async (operationId: string) =>
  Pax.find({ operation: operationId });
