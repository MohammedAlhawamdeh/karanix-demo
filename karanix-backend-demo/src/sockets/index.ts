import { Server } from 'socket.io';
import http from 'http';
import { config } from '../config';

let io: Server | undefined;

export const operationRoom = (operationId: string) => `operation:${operationId}`;
export const vehicleRoom = (vehicleId: string) => `vehicle:${vehicleId}`;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: config.clientOrigin === '*' ? true : config.clientOrigin
    }
  });

  io.on('connection', (socket) => {
    const operationId = socket.handshake.query.operationId as string | undefined;
    const vehicleId = socket.handshake.query.vehicleId as string | undefined;
    if (operationId) {
      socket.join(operationRoom(operationId));
    }
    if (vehicleId) {
      socket.join(vehicleRoom(vehicleId));
    }

    socket.on('joinOperation', (opId: string) => socket.join(operationRoom(opId)));
    socket.on('leaveOperation', (opId: string) => socket.leave(operationRoom(opId)));
    socket.on('joinVehicle', (vId: string) => socket.join(vehicleRoom(vId)));
    socket.on('leaveVehicle', (vId: string) => socket.leave(vehicleRoom(vId)));
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket not initialized');
  return io;
};
