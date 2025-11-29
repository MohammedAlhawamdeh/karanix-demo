/* eslint-disable no-console */
import mongoose from 'mongoose';
import { connectDb } from '../db/connection';
import { Operation } from '../models/Operation';
import { Pax } from '../models/Pax';
import { Vehicle } from '../models/Vehicle';
import { User } from '../models/User';
import { Customer } from '../models/Customer';
import { Location } from '../models/Location';
import { hashPassword } from '../services/authService';

const run = async () => {
  await connectDb();

  await Promise.all([
    Operation.deleteMany({}),
    Pax.deleteMany({}),
    Vehicle.deleteMany({}),
    User.deleteMany({}),
    Customer.deleteMany({}),
    Location.deleteMany({})
  ]);

  const [guidePassword, driverPassword] = await Promise.all([
    hashPassword('guide123'),
    hashPassword('driver123')
  ]);

  const [guideUser, driverUser] = await User.create([
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

  const locations = await Location.create([
    {
      name: 'Central Station Hub',
      coordinates: { lat: 40.7527, lng: -73.9772 },
      customers: []
    },
    {
      name: 'Hotel Plaza',
      coordinates: { lat: 40.7644, lng: -73.974 },
      customers: []
    }
  ]);

  const customers = await Customer.create([
    { name: 'Alex Smith', phone: '+1-555-1111', location: locations[0]._id },
    { name: 'Jamie Doe', phone: '+1-555-2222', location: locations[0]._id },
    { name: 'Taylor Kim', phone: '+1-555-3333', location: locations[1]._id },
    { name: 'Morgan Hart', phone: '+1-555-4444', location: locations[1]._id }
  ]);

  await Location.findByIdAndUpdate(locations[0]._id, {
    $addToSet: { customers: customers.slice(0, 2).map((c) => c._id) }
  });
  await Location.findByIdAndUpdate(locations[1]._id, {
    $addToSet: { customers: customers.slice(2).map((c) => c._id) }
  });

  const operations = await Operation.create([
    {
      code: 'OP-1001',
      tourName: 'City Tour',
      title: 'City Tour - Downtown',
      date: today,
      startTime: today,
      status: 'planned',
      route: [
        { lat: 40.75, lng: -73.99 },
        { lat: 40.77, lng: -73.96 },
        { lat: 40.7033, lng: -74.017 }
      ],
      stops: [
        { name: 'Central Station', location: { lat: 40.7527, lng: -73.9772 } },
        { name: 'Museum Mile', location: { lat: 40.7794, lng: -73.9632 } },
        { name: 'Battery Park', location: { lat: 40.7033, lng: -74.017 } }
      ],
      notes: 'Morning pickup run',
      guideId: guideUser._id,
      driverId: driverUser._id,
      totalPax: 4,
      checkedInCount: 1
    },
    {
      code: 'OP-1002',
      tourName: 'Airport Shuttle',
      title: 'Airport Shuttle',
      date: tomorrow,
      startTime: tomorrow,
      status: 'planned',
      route: [
        { lat: 40.7644, lng: -73.974 },
        { lat: 40.7527, lng: -73.9772 },
        { lat: 40.6444, lng: -73.7822 }
      ],
      stops: [
        { name: 'Hotel Plaza', location: { lat: 40.7644, lng: -73.974 } },
        { name: 'Grand Central', location: { lat: 40.7527, lng: -73.9772 } },
        { name: 'JFK Terminal 4', location: { lat: 40.6444, lng: -73.7822 } }
      ],
      notes: 'Evening outbound shuttle',
      guideId: guideUser._id,
      driverId: driverUser._id,
      totalPax: 4,
      checkedInCount: 0
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
        heading: 90,
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
        heading: 180,
        recordedAt: new Date()
      },
      pingHistory: []
    }
  ]);

  const paxForOp1 = await Pax.create(
    ['Alex Smith', 'Jamie Doe', 'Taylor Kim', 'Morgan Hart'].map((name, idx) => ({
      name,
      phone: customers[idx]?.phone,
      seatNo: `A${idx + 1}`,
      pickupPoint: {
        lat: operations[0].stops[idx % operations[0].stops.length].location.lat + 0.002,
        lng: operations[0].stops[idx % operations[0].stops.length].location.lng - 0.002,
        address: operations[0].stops[idx % operations[0].stops.length].name
      },
      operation: operations[0]._id,
      checkedIn: idx === 0,
      status: idx === 0 ? 'checked_in' : 'waiting',
      checkInTime: idx === 0 ? new Date() : undefined
    }))
  );

  const paxForOp2 = await Pax.create(
    ['Riley Green', 'Jordan Brown', 'Casey White', 'Sam Blue'].map((name, idx) => ({
      name,
      phone: `+1-555-5${idx}${idx}${idx}${idx}`,
      seatNo: `B${idx + 1}`,
      pickupPoint: {
        lat: operations[1].stops[idx % operations[1].stops.length].location.lat + 0.001,
        lng: operations[1].stops[idx % operations[1].stops.length].location.lng + 0.001,
        address: operations[1].stops[idx % operations[1].stops.length].name
      },
      operation: operations[1]._id,
      status: 'waiting'
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
