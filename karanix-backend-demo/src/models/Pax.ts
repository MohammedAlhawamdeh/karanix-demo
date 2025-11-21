import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPax extends Document {
  name: string;
  seat?: string;
  checkedIn: boolean;
  checkInTime?: Date;
  operation: Types.ObjectId;
}

const PaxSchema = new Schema<IPax>(
  {
    name: { type: String, required: true },
    seat: { type: String },
    checkedIn: { type: Boolean, default: false },
    checkInTime: { type: Date },
    operation: { type: Schema.Types.ObjectId, ref: 'Operation', required: true }
  },
  { timestamps: true }
);

export const Pax = mongoose.model<IPax>('Pax', PaxSchema);
