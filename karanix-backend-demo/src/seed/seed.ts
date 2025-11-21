/* eslint-disable no-console */
import mongoose from 'mongoose';
import { connectDb } from '../db/connection';
import { Operation } from '../models/Operation';
import { Pax } from '../models/Pax';
import { Vehicle } from '../models/Vehicle';
import { User } from '../models/User';
import { hashPassword } from '../services/authService';

const run = async () => {
  await connectDb();

  await Promise.all([
    Operation.deleteMany({}),
    Pax.deleteMany({}),
    Vehicle.deleteMany({}),
    User.deleteMany({})
  ]);

  const [guidePassword, driverPassword] = await Promise.all([
    hashPassword('guide123'),
    hashPassword('driver123')
  ]);

  await User.create([
    { name: 'Grace Guide', email: 'guide@example.com', password: guidePassword, role: 'guide' },
    {
      name: 'Diego Driver',
      email: 'driver@example.com',
      password: driverPassword,
      role: 'driver'
    }
  ]);

  const today = new Date();
  today.setHours(9, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const operations = await Operation.create([
    {
      title: 'City Tour - Downtown',
      date: today,
      status: 'planned',
      stops: [
        { name: 'Central Station', location: { lat: 40.7527, lng: -73.9772 } },
        { name: 'Museum Mile', location: { lat: 40.7794, lng: -73.9632 } },
        { name: 'Battery Park', location: { lat: 40.7033, lng: -74.017 } }
      ],
      notes: 'Morning pickup run'
    },
    {
      title: 'Airport Shuttle',
      date: tomorrow,
      status: 'planned',
      stops: [
        { name: 'Hotel Plaza', location: { lat: 40.7644, lng: -73.974 } },
        { name: 'Grand Central', location: { lat: 40.7527, lng: -73.9772 } },
        { name: 'JFK Terminal 4', location: { lat: 40.6444, lng: -73.7822 } }
      ],
      notes: 'Evening outbound shuttle'
    }
  ]);

  const vehicles = await Vehicle.create([
    {
      name: 'Shuttle Alpha',
      driverName: 'Diego Driver',
      operation: operations[0]._id,
      lastPing: {
        location: { lat: 40.75, lng: -73.99 },
        speed: 30,
        recordedAt: new Date()
      },
      pingHistory: []
    },
    {
      name: 'Shuttle Bravo',
      driverName: 'Bella Drive',
      operation: operations[1]._id,
      lastPing: {
        location: { lat: 40.72, lng: -73.95 },
        speed: 28,
        recordedAt: new Date()
      },
      pingHistory: []
    }
  ]);

  const paxForOp1 = await Pax.create(
    ['Alex Smith', 'Jamie Doe', 'Taylor Kim', 'Morgan Hart'].map((name, idx) => ({
      name,
      seat: `A${idx + 1}`,
      operation: operations[0]._id,
      checkedIn: idx === 0,
      checkInTime: idx === 0 ? new Date() : undefined
    }))
  );

  const paxForOp2 = await Pax.create(
    ['Riley Green', 'Jordan Brown', 'Casey White', 'Sam Blue'].map((name, idx) => ({
      name,
      seat: `B${idx + 1}`,
      operation: operations[1]._id
    }))
  );

  operations[0].vehicles = [vehicles[0]._id];
  operations[0].pax = paxForOp1.map((p) => p._id);
  operations[1].vehicles = [vehicles[1]._id];
  operations[1].pax = paxForOp2.map((p) => p._id);

  await operations[0].save();
  await operations[1].save();

  console.log('Seeded operations:', operations.map((o) => o.title));
  console.log('Guide login: guide@example.com / guide123');
  console.log('Driver login: driver@example.com / driver123');
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
