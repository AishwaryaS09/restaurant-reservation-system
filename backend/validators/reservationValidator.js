const { body } = require('express-validator');

const timeSlots = [
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00',
];

const createReservationValidator = [
  body('reservationDate')
    .notEmpty().withMessage('Reservation date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Reservation date cannot be in the past');
      }
      return true;
    }),
  body('timeSlot')
    .notEmpty().withMessage('Time slot is required')
    .isIn(timeSlots).withMessage(`Invalid time slot. Must be one of: ${timeSlots.join(', ')}`),
  body('guestCount')
    .notEmpty().withMessage('Guest count is required')
    .isInt({ min: 1, max: 20 }).withMessage('Guest count must be between 1 and 20'),
];

module.exports = { createReservationValidator };
