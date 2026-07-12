const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

const createReservation = async (customerId, { reservationDate, timeSlot, guestCount }) => {
  const date = new Date(reservationDate);
  date.setHours(0, 0, 0, 0);

  const tables = await Table.find({ capacity: { $gte: guestCount }, status: 'available' })
    .sort({ capacity: 1, tableNumber: 1 });

  if (!tables.length) {
    throw Object.assign(
      new Error(`No available table with capacity for ${guestCount} guests. The largest table seats 8 guests.`),
      { statusCode: 409 }
    );
  }

  const reservedTableIds = await Reservation.find({
    reservationDate: date,
    timeSlot,
    reservationStatus: { $ne: 'cancelled' },
  }).distinct('table');

  const availableTable = tables.find((t) => !reservedTableIds.includes(t._id.toString()));

  if (!availableTable) {
    throw Object.assign(
      new Error('No tables available for the selected date and time slot. Please choose a different date or time.'),
      { statusCode: 409 }
    );
  }

  try {
    const reservation = await Reservation.create({
      customer: customerId,
      table: availableTable._id,
      reservationDate: date,
      timeSlot,
      guestCount,
    });

    return reservation.populate(['table', 'customer']);
  } catch (error) {
    if (error.code === 11000) {
      const remainingTables = tables.filter(
        (t) => t._id.toString() !== availableTable._id.toString()
      );

      const nextAvailable = remainingTables.find(
        (t) => !reservedTableIds.includes(t._id.toString())
      );

      if (!nextAvailable) {
        throw Object.assign(
          new Error('No tables available for the selected date and time slot. Please choose a different date or time.'),
          { statusCode: 409 }
        );
      }

      const retryReservation = await Reservation.create({
        customer: customerId,
        table: nextAvailable._id,
        reservationDate: date,
        timeSlot,
        guestCount,
      });

      return retryReservation.populate(['table', 'customer']);
    }
    throw error;
  }
};

const getAvailableSlots = async (reservationDate, guestCount) => {
  const date = new Date(reservationDate);
  date.setHours(0, 0, 0, 0);

  const timeSlots = [
    '12:00', '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00', '20:00', '21:00',
  ];

  const availableSlots = [];

  for (const slot of timeSlots) {
    const tables = await Table.find({ capacity: { $gte: guestCount }, status: 'available' })
      .sort({ capacity: 1, tableNumber: 1 });

    const reservedTableIds = await Reservation.find({
      reservationDate: date,
      timeSlot: slot,
      reservationStatus: { $ne: 'cancelled' },
    }).distinct('table');

    const hasAvailable = tables.some((t) => !reservedTableIds.includes(t._id.toString()));

    if (hasAvailable) {
      availableSlots.push(slot);
    }
  }

  return availableSlots;
};

module.exports = { createReservation, getAvailableSlots };
