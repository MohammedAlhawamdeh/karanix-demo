import mongoose, { Schema, Document, Types } from 'mongoose';

export type PaxStatus = 'waiting' | 'checked_in' | 'no_show';

export interface IPickupPoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface IPax extends Document {
  name: string;
  phone?: string;
  seatNo?: string;
  status: PaxStatus;
  checkedIn: boolean;
  checkInTime?: Date;
  pickupPoint?: IPickupPoint;
  reservationId?: string;
  notes?: string;
  operation: Types.ObjectId;
}

const PickupPointSchema = new Schema<IPickupPoint>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  { _id: false }
);

const PaxSchema = new Schema<IPax>(
  {
    name: { type: String, required: true },
    phone: { type: String },
    seatNo: { type: String },
    status: { type: String, enum: ['waiting', 'checked_in', 'no_show'], default: 'waiting' },
    checkedIn: { type: Boolean, default: false },
    checkInTime: { type: Date },
    pickupPoint: { type: PickupPointSchema },
    reservationId: { type: String },
    notes: { type: String },
    operation: { type: Schema.Types.ObjectId, ref: 'Operation', required: true }
  },
  { timestamps: true }
);

export const Pax = mongoose.model<IPax>('Pax', PaxSchema);
