require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const reservationRoutes = require('./routes/reservations');
const tableRoutes = require('./routes/tables');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to MongoDB
connectDB();

// Allowed Origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://restaurant-reservation-system-inky.vercel.app'
];

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Restaurant Reservation API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});