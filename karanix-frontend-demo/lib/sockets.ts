import { io, Socket } from 'socket.io-client';
import { API_BASE } from './api';

export type SocketEvents = 'vehicle:update' | 'manifest:update' | 'operation:start';

export const createSocket = (operationId?: string): Socket => {
  return io(API_BASE, {
    transports: ['websocket'],
    query: operationId ? { operationId } : undefined
  });
};
