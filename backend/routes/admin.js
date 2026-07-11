const express = require('express');
const router = express.Router();
const {
  getAllReservations,
  getReservationsByDate,
  updateReservation,
  deleteReservation,
  getDashboardStats,
  getUsers,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/reservations', getAllReservations);
router.get('/reservations/date/:date', getReservationsByDate);
router.put('/reservations/:id', updateReservation);
router.delete('/reservations/:id', deleteReservation);
router.get('/users', getUsers);

module.exports = router;
