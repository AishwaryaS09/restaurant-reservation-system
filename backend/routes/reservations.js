const express = require('express');
const router = express.Router();
const { create, getMyReservations, cancelMyReservation, checkAvailability } = require('../controllers/reservationController');
const { createReservationValidator } = require('../validators/reservationValidator');
const { protect } = require('../middleware/auth');

router.get('/availability', protect, checkAvailability);
router.post('/', protect, createReservationValidator, create);
router.get('/my', protect, getMyReservations);
router.delete('/:id', protect, cancelMyReservation);

module.exports = router;
