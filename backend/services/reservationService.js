const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

const normalizeDate = (dateStr) => {
  const str = (typeof dateStr === 'string' ? dateStr : String(dateStr)).split('T')[0];
  const [y, m, d] = str.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const getDateRange = (dateStr) => {
  const start = normalizeDate(dateStr);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

const getReservedTableIdStrings = async (dateStart, dateEnd, timeSlot) => {
  const ids = await Reservation.find({
    reservationDate: { $gte: dateStart, $lt: dateEnd },
    timeSlot,
    reservationStatus: { $ne: 'cancelled' },
  }).distinct('table');
  return ids.map((id) => id.toString());
};

const createReservation = async (customerId, { reservationDate, timeSlot, guestCount }) => {
  const { start, end } = getDateRange(reservationDate);

  const tables = await Table.find({ capacity: { $gte: guestCount }, status: 'available' })
    .sort({ capacity: 1, tableNumber: 1 });

  if (!tables.length) {
    throw Object.assign(
      new Error(`No available table with capacity for ${guestCount} guests. The largest table seats 8 guests.`),
      { statusCode: 409 }
    );
  }

  const reservedTableIdStrings = await getReservedTableIdStrings(start, end, timeSlot);

  const candidates = tables.filter((t) => !reservedTableIdStrings.includes(t._id.toString()));

  if (!candidates.length) {
    throw Object.assign(
      new Error('No tables available for the selected date and time slot. Please choose a different date or time.'),
      { statusCode: 409 }
    );
  }

  let lastError = null;
  for (const table of candidates) {
    try {
      const reservation = await Reservation.create({
        customer: customerId,
        table: table._id,
        reservationDate: start,
        timeSlot,
        guestCount,
      });
      return reservation.populate(['table', 'customer']);
    } catch (error) {
      lastError = error;
      if (error.code !== 11000) throw error;
    }
  }

  throw Object.assign(
    new Error(
      lastError
        ? 'No tables available for the selected date and time slot. Please choose a different date or time.'
        : `No available table with capacity for ${guestCount} guests. The largest table seats 8 guests.`
    ),
    { statusCode: 409 }
  );
};

const getAvailableSlots = async (reservationDate, guestCount) => {
  const { start, end } = getDateRange(reservationDate);

  const tables = await Table.find({ capacity: { $gte: guestCount }, status: 'available' })
    .sort({ capacity: 1, tableNumber: 1 });

  if (!tables.length) return [];

  const timeSlots = [
    '12:00', '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00', '20:00', '21:00',
  ];

  const availableSlots = [];

  for (const slot of timeSlots) {
    const reservedTableIdStrings = await getReservedTableIdStrings(start, end, slot);
    const hasAvailable = tables.some((t) => !reservedTableIdStrings.includes(t._id.toString()));
    if (hasAvailable) {
      availableSlots.push(slot);
    }
  }

  return availableSlots;
};

module.exports = { createReservation, getAvailableSlots };
