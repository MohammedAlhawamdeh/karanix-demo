import { io, Socket } from 'socket.io-client';
import { API_BASE } from './api';

export type SocketEvents =
  | 'operation:vehicle_position'
  | 'operation:manifest_update'
  | 'operation:start'
  | 'operation:warning'
  | 'vehicle:position';

export const createSocket = (operationId?: string, vehicleId?: string): Socket => {
  return io(API_BASE, {
    transports: ['websocket'],
    query: operationId || vehicleId ? { operationId, vehicleId } : undefined
  });
};
