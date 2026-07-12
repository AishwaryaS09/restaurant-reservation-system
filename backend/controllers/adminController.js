const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const User = require('../models/User');

const normalizeDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate('customer', 'name email')
      .populate('table')
      .sort({ reservationDate: -1, timeSlot: -1 });

    res.json({ reservations });
  } catch (error) {
    next(error);
  }
};

const getReservationsByDate = async (req, res, next) => {
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.params.date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    const date = normalizeDate(req.params.date);
    const nextDay = new Date(date);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const reservations = await Reservation.find({
      reservationDate: { $gte: date, $lt: nextDay },
    })
      .populate('customer', 'name email')
      .populate('table')
      .sort({ timeSlot: 1 });

    res.json({ reservations });
  } catch (error) {
    next(error);
  }
};

const updateReservation = async (req, res, next) => {
  try {
    const { reservationStatus, guestCount, timeSlot, reservationDate } = req.body;

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservationStatus) reservation.reservationStatus = reservationStatus;
    if (guestCount) reservation.guestCount = guestCount;

    const newTimeSlot = timeSlot || reservation.timeSlot;
    const newDate = reservationDate ? normalizeDate(reservationDate) : reservation.reservationDate;

    if (timeSlot || reservationDate) {
      const conflict = await Reservation.findOne({
        _id: { $ne: reservation._id },
        table: reservation.table,
        reservationDate: newDate,
        timeSlot: newTimeSlot,
        reservationStatus: { $ne: 'cancelled' },
      });

      if (conflict) {
        return res.status(409).json({ message: 'Time slot conflict: table already reserved for the new date/time' });
      }
    }

    if (reservationDate) reservation.reservationDate = newDate;
    if (timeSlot) reservation.timeSlot = newTimeSlot;

    await reservation.save();

    const updated = await Reservation.findById(reservation._id)
      .populate('customer', 'name email')
      .populate('table');

    res.json({ message: 'Reservation updated successfully', reservation: updated });
  } catch (error) {
    next(error);
  }
};

const deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    const [
      totalReservations,
      todayReservations,
      availableTables,
      cancelledReservations,
      totalTables,
      totalUsers,
    ] = await Promise.all([
      Reservation.countDocuments(),
      Reservation.countDocuments({
        reservationDate: { $gte: todayStart, $lt: todayEnd },
        reservationStatus: { $ne: 'cancelled' },
      }),
      Table.countDocuments({ status: 'available' }),
      Reservation.countDocuments({ reservationStatus: 'cancelled' }),
      Table.countDocuments(),
      User.countDocuments(),
    ]);

    res.json({
      totalReservations,
      todayReservations,
      availableTables,
      cancelledReservations,
      totalTables,
      totalUsers,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReservations,
  getReservationsByDate,
  updateReservation,
  deleteReservation,
  getDashboardStats,
  getUsers,
};
