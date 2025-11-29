import { getIO, operationRoom, vehicleRoom } from './index';
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
  tryEmit((io) => {
    io.to(operationRoom(operationId)).emit('operation:vehicle_position', {
      operationId,
      vehicle
    });
    if (vehicle.id) {
      io.to(vehicleRoom(vehicle.id)).emit('vehicle:position', {
        vehicleId: vehicle.id,
        vehicle
      });
    }
  });
};

export const emitManifestUpdate = (operationId: string, pax: IPax, checkedInCount?: number) => {
  tryEmit((io) =>
    io.to(operationRoom(operationId)).emit('operation:manifest_update', {
      operationId,
      pax,
      checkedInCount
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

export const emitWarning = (operationId: string, message: string) => {
  tryEmit((io) =>
    io.to(operationRoom(operationId)).emit('operation:warning', {
      operationId,
      message
    })
  );
};
