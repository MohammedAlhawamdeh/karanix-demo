import { isValidObjectId } from 'mongoose';
import { Operation, IOperation, OperationStatus } from '../models/Operation';
import { notFound, badRequest } from '../utils/httpErrors';

export const listOperations = async (filters: { date?: string; status?: OperationStatus }) => {
  const query: Record<string, unknown> = {};

  if (filters.date) {
    const date = new Date(filters.date);
    if (Number.isNaN(date.getTime())) {
      throw badRequest('Invalid date parameter');
    }
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  }

  if (filters.status) {
    query.status = filters.status;
  }

  return Operation.find(query)
    .populate('pax')
    .populate('vehicles')
    .sort({ date: 1 })
    .exec();
};

export const getOperation = async (id: string): Promise<IOperation> => {
  if (!isValidObjectId(id)) throw badRequest('Invalid operation id');
  const op = await Operation.findById(id).populate('pax').populate('vehicles').exec();
  if (!op) throw notFound('Operation not found');
  return op;
};

export const startOperation = async (id: string): Promise<IOperation> => {
  const op = await getOperation(id);
  op.status = 'active';
  await op.save();
  return op;
};
