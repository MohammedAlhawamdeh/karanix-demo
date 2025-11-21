import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPing {
  location: {
    lat: number;
    lng: number;
  };
  speed?: number;
  recordedAt: Date;
}

export interface IVehicle extends Document {
  name: string;
  driverName: string;
  operation?: Types.ObjectId;
  lastPing?: IPing;
  pingHistory: IPing[];
}

const PingSchema = new Schema<IPing>(
  {
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    speed: { type: Number },
    recordedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const VehicleSchema = new Schema<IVehicle>(
  {
    name: { type: String, required: true },
    driverName: { type: String, required: true },
    operation: { type: Schema.Types.ObjectId, ref: 'Operation' },
    lastPing: { type: PingSchema },
    pingHistory: { type: [PingSchema], default: [] }
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
