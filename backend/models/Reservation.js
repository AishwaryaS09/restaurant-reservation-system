const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    reservationDate: {
      type: Date,
      required: [true, 'Reservation date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      enum: [
        '12:00', '13:00', '14:00', '15:00', '16:00',
        '17:00', '18:00', '19:00', '20:00', '21:00',
      ],
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'At least 1 guest required'],
      max: [20, 'Maximum 20 guests allowed'],
    },
    reservationStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

reservationSchema.index(
  { table: 1, reservationDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { reservationStatus: { $ne: 'cancelled' } },
  }
);

module.exports = mongoose.model('Reservation', reservationSchema);
