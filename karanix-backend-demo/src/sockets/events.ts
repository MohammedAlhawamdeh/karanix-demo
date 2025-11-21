import { getIO, operationRoom } from './index';
import { IPax } from '../models/Pax';
import { IVehicle } from '../models/Vehicle';

const tryEmit = (fn: (io: ReturnType<typeof getIO>) => void) => {
  try {
    const io = getIO();
    fn(io);
  } catch {
    // Socket server not initialized (e.g., during tests); swallow.
  }
};

export const emitVehicleUpdate = (operationId: string, vehicle: IVehicle) => {
  tryEmit((io) =>
    io.to(operationRoom(operationId)).emit('vehicle:update', {
      operationId,
      vehicle
    })
  );
};

export const emitManifestUpdate = (operationId: string, pax: IPax) => {
  tryEmit((io) =>
    io.to(operationRoom(operationId)).emit('manifest:update', {
      operationId,
      pax
    })
  );
};

export const emitOperationStart = (operationId: string) => {
  tryEmit((io) =>
    io.to(operationRoom(operationId)).emit('operation:start', {
      operationId,
      status: 'active'
    })
  );
};
