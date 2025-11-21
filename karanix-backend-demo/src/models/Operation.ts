import mongoose, { Schema, Document, Types } from 'mongoose';

export type OperationStatus = 'planned' | 'active' | 'completed';

export interface IStop {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface IOperation extends Document {
  title: string;
  date: Date;
  status: OperationStatus;
  pax: Types.ObjectId[];
  vehicles: Types.ObjectId[];
  stops: IStop[];
  notes?: string;
}

const StopSchema = new Schema<IStop>(
  {
    name: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  { _id: false }
);

const OperationSchema = new Schema<IOperation>(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed'],
      default: 'planned'
    },
    pax: [{ type: Schema.Types.ObjectId, ref: 'Pax' }],
    vehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
    stops: { type: [StopSchema], default: [] },
    notes: { type: String }
  },
  { timestamps: true }
);

export const Operation = mongoose.model<IOperation>('Operation', OperationSchema);
