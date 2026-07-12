const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany({}),
      Table.deleteMany({}),
      Reservation.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    console.log('Admin created: admin@example.com / password123');

    const customers = await User.create([
      { name: 'John Doe', email: 'john@example.com', password: 'password123' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'password123' },
      { name: 'Bob Wilson', email: 'bob@example.com', password: 'password123' },
      { name: 'Alice Brown', email: 'alice@example.com', password: 'password123' },
      { name: 'Charlie Davis', email: 'charlie@example.com', password: 'password123' },
    ]);
    console.log('5 sample customers created');

    const tables = await Table.create([
      { tableNumber: 1, capacity: 2 },
      { tableNumber: 2, capacity: 2 },
      { tableNumber: 3, capacity: 4 },
      { tableNumber: 4, capacity: 4 },
      { tableNumber: 5, capacity: 6 },
      { tableNumber: 6, capacity: 8 },
    ]);
    console.log('6 restaurant tables created');

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const reservations = await Reservation.create([
      {
        customer: customers[0]._id,
        table: tables[0]._id,
        reservationDate: tomorrow,
        timeSlot: '18:00',
        guestCount: 2,
        reservationStatus: 'confirmed',
      },
      {
        customer: customers[1]._id,
        table: tables[2]._id,
        reservationDate: tomorrow,
        timeSlot: '19:00',
        guestCount: 3,
        reservationStatus: 'confirmed',
      },
      {
        customer: customers[2]._id,
        table: tables[4]._id,
        reservationDate: tomorrow,
        timeSlot: '20:00',
        guestCount: 5,
        reservationStatus: 'confirmed',
      },
    ]);
    console.log('3 sample reservations created');

    console.log('\nDatabase seeded successfully!');
    console.log('Admin login: admin@example.com / password123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
