import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { operationsRouter } from './routes/operations';
import { vehiclesRouter } from './routes/vehicles';
import { paxRouter } from './routes/pax';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(
  cors({
    origin: config.clientOrigin === '*' ? undefined : config.clientOrigin
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/operations', operationsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/pax', paxRouter);
app.use('/api/auth', authRouter);

app.use(errorHandler);

export default app;
