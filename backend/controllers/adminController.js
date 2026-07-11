const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const User = require('../models/User');

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
    const date = new Date(req.params.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

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
    const newDate = reservationDate ? new Date(reservationDate) : reservation.reservationDate;

    if (timeSlot || reservationDate) {
      const dateForCheck = new Date(newDate);
      dateForCheck.setHours(0, 0, 0, 0);

      const conflict = await Reservation.findOne({
        _id: { $ne: reservation._id },
        table: reservation.table,
        reservationDate: dateForCheck,
        timeSlot: newTimeSlot,
        reservationStatus: { $ne: 'cancelled' },
      });

      if (conflict) {
        return res.status(409).json({ message: 'Time slot conflict: table already reserved for the new date/time' });
      }
    }

    if (reservationDate) reservation.reservationDate = new Date(reservationDate);
    if (timeSlot) reservation.timeSlot = timeSlot;

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

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
        reservationDate: { $gte: todayStart, $lte: todayEnd },
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
