import { Operation } from '../models/Operation';
import { OperationAlert } from '../models/OperationAlert';
import { emitWarning } from '../sockets/events';
import { markWarningSent } from './operationService';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export const evaluateCheckInWarnings = async () => {
  const now = new Date();
  const threshold = new Date(now.getTime() - FIFTEEN_MINUTES_MS);

  const candidates = await Operation.find({
    status: { $in: ['planned', 'active'] },
    startTime: { $lte: threshold }
  })
    .populate('pax')
    .exec();

  for (const op of candidates) {
    const total = op.totalPax || op.pax.length;
    if (total === 0) continue;
    const checkedIn = op.checkedInCount || op.pax.filter((p: any) => p.checkedIn).length;
    const ratio = checkedIn / total;
    const alreadyWarned = op.lastWarningSentAt && op.lastWarningSentAt > threshold;
    if (ratio < 0.7 && !alreadyWarned) {
      const message = `Check-in rate below 70% (${checkedIn}/${total}) for operation ${op.code}`;
      await OperationAlert.create({
        operation: op._id,
        type: 'warning',
        message
      });
      emitWarning(op.id, message);
      await markWarningSent(op.id);
    }
  }
};
