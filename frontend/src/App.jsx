import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import NewReservation from './pages/NewReservation';
import MyReservations from './pages/MyReservations';
import AdminDashboard from './pages/AdminDashboard';
import AdminReservations from './pages/AdminReservations';
import AdminUsers from './pages/AdminUsers';
import ManageTables from './pages/ManageTables';
import NotFound from './pages/NotFound';

function RedirectIfAuthenticated({ children }) {
  const { user } = useContext(AuthContext);
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <div className="min-vh-100" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfAuthenticated>
                <Register />
              </RedirectIfAuthenticated>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations/new"
            element={
              <ProtectedRoute role="customer">
                <NewReservation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations/my"
            element={
              <ProtectedRoute role="customer">
                <MyReservations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reservations"
            element={
              <ProtectedRoute role="admin">
                <AdminReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tables"
            element={
              <ProtectedRoute role="admin">
                <ManageTables />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}
