import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { Operation } from '../models/Operation';
import { Pax } from '../models/Pax';
import { Vehicle } from '../models/Vehicle';

// Set the secret before importing the app/config.
process.env.JWT_SECRET = 'test-secret';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require('../app').default;

const makeToken = (role: 'guide' | 'driver') =>
  jwt.sign({ userId: 'test', role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

describe('API endpoints', () => {
  let mongo: MongoMemoryServer;
  let operationId: string;
  let paxId: string;
  let vehicleId: string;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  beforeEach(async () => {
    await Promise.all([Operation.deleteMany({}), Pax.deleteMany({}), Vehicle.deleteMany({})]);

    const operation = await Operation.create({
      title: 'Test Operation',
      date: new Date('2024-01-01T09:00:00Z'),
      status: 'planned',
      stops: []
    });

    const pax = await Pax.create({
      name: 'Test Pax',
      seat: 'A1',
      operation: operation._id
    });

    const vehicle = await Vehicle.create({
      name: 'Bus 1',
      driverName: 'Driver',
      operation: operation._id
    });

    operation.pax = [pax._id];
    operation.vehicles = [vehicle._id];
    await operation.save();

    operationId = operation.id;
    paxId = pax.id;
    vehicleId = vehicle.id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  });

  it('lists operations filtered by date', async () => {
    const res = await request(app).get('/api/operations').query({ date: '2024-01-01' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Test Operation');
  });

  it('starts an operation', async () => {
    const token = makeToken('guide');
    const res = await request(app)
      .post(`/api/operations/${operationId}/start`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('active');
  });

  it('checks in a passenger', async () => {
    const token = makeToken('guide');
    const res = await request(app)
      .post(`/api/pax/${paxId}/checkin`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.checkedIn).toBe(true);
  });

  it('records a vehicle heartbeat', async () => {
    const token = makeToken('driver');
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/heartbeat`)
      .set('Authorization', `Bearer ${token}`)
      .send({ location: { lat: 1, lng: 2 }, speed: 25 });
    expect(res.status).toBe(200);
    expect(res.body.lastPing.location.lat).toBe(1);
    expect(res.body.lastPing.location.lng).toBe(2);
  });
});
