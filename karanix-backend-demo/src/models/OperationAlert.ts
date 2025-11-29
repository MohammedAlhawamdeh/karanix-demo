import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOperationAlert extends Document {
  operation: Types.ObjectId;
  type: 'warning';
  message: string;
  sentAt: Date;
}

const OperationAlertSchema = new Schema<IOperationAlert>(
  {
    operation: { type: Schema.Types.ObjectId, ref: 'Operation', required: true },
    type: { type: String, enum: ['warning'], required: true },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const OperationAlert = mongoose.model<IOperationAlert>('OperationAlert', OperationAlertSchema);
