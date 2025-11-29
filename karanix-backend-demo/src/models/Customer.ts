import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone?: string;
  email?: string;
  location?: Types.ObjectId;
  pickupPoint?: {
    lat: number;
    lng: number;
    address?: string;
  };
  notes?: string;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    location: { type: Schema.Types.ObjectId, ref: 'Location' },
    pickupPoint: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String }
    },
    notes: { type: String }
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
