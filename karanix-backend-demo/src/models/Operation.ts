import mongoose, { Schema, Document, Types } from 'mongoose';

export type OperationStatus = 'planned' | 'active' | 'completed' | 'cancelled';

export interface IStop {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface ICoordinate {
  lat: number;
  lng: number;
}

export interface IOperation extends Document {
  code: string;
  tourName: string;
  title: string;
  date: Date;
  startTime: Date;
  status: OperationStatus;
  pax: Types.ObjectId[];
  vehicles: Types.ObjectId[];
  driverId?: Types.ObjectId;
  guideId?: Types.ObjectId;
  totalPax: number;
  checkedInCount: number;
  route: ICoordinate[];
  stops: IStop[];
  notes?: string;
  lastWarningSentAt?: Date;
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

const CoordinateSchema = new Schema<ICoordinate>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  { _id: false }
);

const OperationSchema = new Schema<IOperation>(
  {
    code: { type: String, required: true, unique: true },
    tourName: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed', 'cancelled'],
      default: 'planned'
    },
    pax: [{ type: Schema.Types.ObjectId, ref: 'Pax' }],
    vehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
    guideId: { type: Schema.Types.ObjectId, ref: 'User' },
    totalPax: { type: Number, default: 0 },
    checkedInCount: { type: Number, default: 0 },
    route: { type: [CoordinateSchema], default: [] },
    stops: { type: [StopSchema], default: [] },
    notes: { type: String },
    lastWarningSentAt: { type: Date }
  },
  { timestamps: true }
);

export const Operation = mongoose.model<IOperation>('Operation', OperationSchema);
