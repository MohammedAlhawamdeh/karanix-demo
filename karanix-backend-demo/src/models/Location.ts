import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  customers: Types.ObjectId[];
}

const LocationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    customers: [{ type: Schema.Types.ObjectId, ref: 'Customer' }]
  },
  { timestamps: true }
);

export const Location = mongoose.model<ILocation>('Location', LocationSchema);
