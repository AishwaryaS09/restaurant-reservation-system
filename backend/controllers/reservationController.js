const { validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { createReservation, getAvailableSlots } = require('../services/reservationService');

const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const reservation = await createReservation(req.user._id, req.body);

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ customer: req.user._id })
      .populate('table')
      .sort({ reservationDate: -1, timeSlot: -1 });

    res.json({ reservations });
  } catch (error) {
    next(error);
  }
};

const cancelMyReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.reservationStatus === 'cancelled') {
      return res.status(400).json({ message: 'Reservation is already cancelled' });
    }

    reservation.reservationStatus = 'cancelled';
    await reservation.save();

    res.json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error) {
    next(error);
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const { date, guestCount } = req.query;

    if (!date || !guestCount) {
      return res.status(400).json({ message: 'Date and guestCount are required' });
    }

    const availableSlots = await getAvailableSlots(date, parseInt(guestCount));
    const tables = await Table.find({ capacity: { $gte: parseInt(guestCount) } });

    res.json({
      availableSlots,
      suitableTables: tables,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getMyReservations, cancelMyReservation, checkAvailability };
