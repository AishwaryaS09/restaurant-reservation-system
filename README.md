# Restaurant Reservation Management System

A full-stack web application for managing restaurant table reservations with role-based access control for customers and administrators.

---

## Tech Stack

**Frontend:** React, React Router, Axios, Bootstrap 5  
**Backend:** Node.js, Express.js  
**Database:** MongoDB Atlas, Mongoose  
**Auth:** JWT (JSON Web Tokens), bcrypt  
**Deployment:** Vercel (Frontend), Render (Backend)

---

## Folder Structure

```
fission/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Request handlers
│   ├── middleware/       # Auth, role check, error handling
│   ├── models/          # Mongoose schemas (User, Table, Reservation)
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic (reservation engine)
│   ├── utils/           # Helper utilities
│   ├── validators/      # Express-validator rules
│   ├── seed/            # Database seeder
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components (Navbar, ProtectedRoute)
│   │   ├── pages/       # Page components (Login, Dashboard, etc.)
│   │   ├── context/     # AuthContext (React Context API)
│   │   ├── services/    # Axios API client
│   │   ├── App.jsx      # Route definitions
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json         # Root scripts
└── README.md
```

---

## Installation

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the repository

```bash
git clone <repo-url>
cd fission
```

### 2. Install dependencies

```bash
npm run install-all
```

This runs `npm install` in both `backend/` and `frontend/`.

---

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/restaurant_reservation?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:5000
```

For production, set `VITE_API_URL` to your deployed backend URL.

---

## Database Setup (MongoDB Atlas)

1. Create a free MongoDB Atlas cluster at https://www.mongodb.com/atlas
2. Create a database user (username + password)
3. Whitelist your IP (or `0.0.0.0/0` for development)
4. Get your connection string and paste it into `backend/.env` as `MONGO_URI`
5. Set the database name to `restaurant_reservation`

---

## Seed Command

Populate the database with sample data:

```bash
npm run seed
```

This creates:

- **1 Admin:** `admin@example.com` / `password123`
- **5 Customers:** john@example.com, jane@example.com, bob@example.com, alice@example.com, charlie@example.com (all with password `password123`)
- **6 Tables:** capacities 2, 2, 4, 4, 6, 8
- **3 Sample Reservations**

---

## Run the Application

### Backend

```bash
cd backend
npm run dev
```

Server starts on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm run dev
```

Frontend starts on `http://localhost:3000`

---

## API Documentation

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

**Register Request:**
```json
{ "name": "John", "email": "john@example.com", "password": "password123" }
```

**Login Request:**
```json
{ "email": "admin@example.com", "password": "password123" }
```

**Response:**
```json
{ "token": "jwt_token...", "user": { "id": "...", "name": "...", "email": "...", "role": "customer|admin" } }
```

### Customer Reservations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reservations/availability?date=2024-01-01&guestCount=4` | Check available slots | Yes |
| POST | `/api/reservations` | Create reservation | Yes |
| GET | `/api/reservations/my` | Get my reservations | Yes |
| DELETE | `/api/reservations/:id` | Cancel my reservation | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Dashboard stats | Admin |
| GET | `/api/admin/reservations` | All reservations | Admin |
| GET | `/api/admin/reservations/date/:date` | Filter by date | Admin |
| PUT | `/api/admin/reservations/:id` | Update reservation | Admin |
| DELETE | `/api/admin/reservations/:id` | Delete reservation | Admin |
| GET | `/api/admin/users` | List users | Admin |

### Table Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tables` | List tables | Yes |
| POST | `/api/tables` | Create table | Admin |
| PUT | `/api/tables/:id` | Update table | Admin |
| DELETE | `/api/tables/:id` | Delete table | Admin |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 409 | Conflict (double booking) |
| 500 | Internal Server Error |

---

## Reservation Logic

The core reservation algorithm works as follows:

1. **Input Validation:** Validate date, time slot, and guest count
2. **Find Suitable Tables:** Query all tables where `capacity >= guestCount`, sorted by table number
3. **Check Availability:** Query existing reservations for the same `date` AND `timeSlot` where status is NOT `cancelled`. Collect the IDs of reserved tables
4. **Assign Table:** Select the first table from the suitable list that is NOT in the reserved set
5. **Create Reservation:** If an available table is found, create the reservation with status `confirmed`
6. **Reject:** If no table is available, return `409 Conflict` with a meaningful error message

**Key design decisions:**
- Double booking is prevented by the composite index on `(table, reservationDate, timeSlot)`
- The `getAvailableSlots` service pre-computes which time slots are available for a given date and guest count
- Time slots are discrete (no overlap) — a reservation at `18:00` is for that hour only

---

## Role-Based Access

### Customer
- Can register and login
- Can view their own dashboard with stats
- Can create new reservations (with availability checking)
- Can view only their own reservations
- Can cancel only their own reservations
- Cannot access any `/admin/*` route
- Trying to access admin APIs returns `403 Forbidden`

### Admin
- Can login (admin accounts are created via seeding only)
- Can view dashboard with system-wide stats
- Can view ALL reservations
- Can filter reservations by date
- Can update any reservation status, guest count, time slot
- Can cancel/delete any reservation
- Can create, edit, and delete restaurant tables
- Can view all users

### Implementation
- **JWT Middleware** (`middleware/auth.js`): Verifies token on every protected request
- **Role Middleware** (`middleware/roleCheck.js`): `authorize('admin')` restricts routes to admins only
- **Frontend** (`ProtectedRoute.jsx`): Checks both authentication and role before rendering pages

---

## How APIs Interact with MongoDB

1. Controllers receive HTTP requests via Express routes
2. Controllers validate input using express-validator
3. Business logic calls Mongoose models to query/update MongoDB
4. The reservation service uses Mongoose queries with indexes for efficiency
5. Mongoose schemas include validation, references (ObjectId), and pre-save hooks
6. The `select: false` on password ensures it's never returned in queries by default

---

## How Frontend Communicates with Backend

1. Axios instance (`services/api.js`) is configured with `baseURL` from environment variable
2. Request interceptor attaches JWT from `localStorage` as `Authorization: Bearer <token>`
3. Response interceptor handles 401 by clearing token and redirecting to login
4. AuthContext manages user state globally using React Context API
5. Components call service functions and receive typed responses
6. ProtectedRoute component guards routes based on auth state and role

---

## Deployment

### Backend (Render)

1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect your repository
4. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables (MONGO_URI, JWT_SECRET, etc.)
6. Deploy

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy

### MongoDB Atlas

- Ensure network access whitelist includes Render's IPs (or `0.0.0.0/0`)
- Use the production connection string in Render's environment variables

---

## Testing Process

### Manual Testing Steps

1. **Registration:** Register a new customer, verify JWT is returned
2. **Login:** Login as customer, verify dashboard loads
3. **Availability Check:** Check available time slots for a date and guest count
4. **Create Reservation:** Create a reservation, verify it appears in "My Reservations"
5. **Double Booking Prevention:** Try to book the same slot with same capacity — should fail
6. **Cancel Reservation:** Cancel a reservation, verify status changes
7. **Admin Access:** Login as admin, verify dashboard stats are correct
8. **Role Protection:** Try accessing `/admin/*` as customer — should redirect
9. **API Protection:** Try accessing APIs without token — should return 401
10. **Table Management:** Admin creates, edits, and deletes tables
11. **Date Filtering:** Admin filters reservations by date

---

## Assumptions

- One restaurant location with fixed tables
- Time slots are discrete (no overlapping reservations — each slot is 1 hour)
- Admin accounts are created through seeding, not self-registration
- Reservation date must be today or in the future
- Maximum 20 guests per reservation
- Cancelled reservations free up the table for the same slot

---

## Known Limitations

- No email notifications for reservation confirmations
- No payment integration
- No recurring reservations
- No waitlist functionality
- No real-time updates (requires WebSocket)
- No pagination for large datasets
- Basic UI (no custom styling framework beyond Bootstrap)

---

## Future Improvements

- Email/SMS notifications
- Online payment integration
- Recurring reservation support
- Waitlist management
- Real-time table status updates (Socket.io)
- Advanced analytics dashboard
- Pagination and search for admin views
- Table layout visualization (floor plan)
- Multi-restaurant support
- Mobile app (React Native)
- Rate limiting and brute force protection
- Unit and integration tests
