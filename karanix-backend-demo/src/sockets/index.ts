import { Server } from 'socket.io';
import http from 'http';
import { config } from '../config';

let io: Server | undefined;

export const operationRoom = (operationId: string) => `operation:${operationId}`;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: config.clientOrigin === '*' ? true : config.clientOrigin
    }
  });

  io.on('connection', (socket) => {
    const operationId = socket.handshake.query.operationId as string | undefined;
    if (operationId) {
      socket.join(operationRoom(operationId));
    }

    socket.on('joinOperation', (opId: string) => socket.join(operationRoom(opId)));
    socket.on('leaveOperation', (opId: string) => socket.leave(operationRoom(opId)));
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket not initialized');
  return io;
};
