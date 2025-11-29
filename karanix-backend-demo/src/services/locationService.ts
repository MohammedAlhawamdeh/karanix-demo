import { isValidObjectId } from 'mongoose';
import { Location, ILocation } from '../models/Location';
import { Customer } from '../models/Customer';
import { badRequest, notFound } from '../utils/httpErrors';

interface LocationPayload {
  name: string;
  coordinates: { lat: number; lng: number };
  customerIds?: string[];
}

export const createLocation = async (payload: LocationPayload): Promise<ILocation> => {
  const location = await Location.create({
    name: payload.name,
    coordinates: payload.coordinates
  });

  if (payload.customerIds?.length) {
    await addCustomersToLocation(location.id, payload.customerIds);
  }

  return location;
};

export const addCustomersToLocation = async (locationId: string, customerIds: string[]) => {
  if (!isValidObjectId(locationId)) throw badRequest('Invalid location id');
  const location = await Location.findById(locationId).exec();
  if (!location) throw notFound('Location not found');

  const validCustomerIds = customerIds.filter((id) => isValidObjectId(id));
  await Customer.updateMany(
    { _id: { $in: validCustomerIds } },
    { location: location._id }
  ).exec();
  await Location.findByIdAndUpdate(locationId, { $addToSet: { customers: { $each: validCustomerIds } } }).exec();

  return Location.findById(locationId).populate('customers');
};

export const listLocations = () => Location.find().populate('customers');
