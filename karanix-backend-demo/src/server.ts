import http from 'http';
import app from './app';
import { config } from './config';
import { connectDb } from './db/connection';
import { initSocket } from './sockets';

const start = async () => {
  await connectDb();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
