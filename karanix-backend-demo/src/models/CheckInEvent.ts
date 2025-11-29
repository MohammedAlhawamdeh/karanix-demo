import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICheckInEvent extends Document {
  eventId: string;
  pax: Types.ObjectId;
  operation: Types.ObjectId;
  method: 'qr' | 'manual';
  gps?: {
    lat: number;
    lng: number;
  };
  photoUrl?: string;
}

const CheckInEventSchema = new Schema<ICheckInEvent>(
  {
    eventId: { type: String, required: true, unique: true },
    pax: { type: Schema.Types.ObjectId, ref: 'Pax', required: true },
    operation: { type: Schema.Types.ObjectId, ref: 'Operation', required: true },
    method: { type: String, enum: ['qr', 'manual'], required: true },
    gps: {
      lat: { type: Number },
      lng: { type: Number }
    },
    photoUrl: { type: String }
  },
  { timestamps: true }
);

export const CheckInEvent = mongoose.model<ICheckInEvent>('CheckInEvent', CheckInEventSchema);
