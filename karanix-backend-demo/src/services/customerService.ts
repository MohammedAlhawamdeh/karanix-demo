import { isValidObjectId } from 'mongoose';
import { Customer, ICustomer } from '../models/Customer';
import { Location } from '../models/Location';
import { badRequest, notFound } from '../utils/httpErrors';

interface CustomerPayload {
  name: string;
  phone?: string;
  email?: string;
  pickupPoint?: { lat: number; lng: number; address?: string };
  notes?: string;
  locationId?: string;
}

export const createCustomer = async (payload: CustomerPayload): Promise<ICustomer> => {
  let locationId: string | undefined;
  if (payload.locationId) {
    if (!isValidObjectId(payload.locationId)) throw badRequest('Invalid location id');
    const location = await Location.findById(payload.locationId).exec();
    if (!location) throw notFound('Location not found');
    locationId = location.id;
  }

  const customer = await Customer.create({
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    pickupPoint: payload.pickupPoint,
    notes: payload.notes,
    location: locationId
  });

  if (locationId) {
    await Location.findByIdAndUpdate(locationId, { $addToSet: { customers: customer._id } }).exec();
  }

  return customer;
};

export const listCustomers = () => Customer.find().populate('location');
