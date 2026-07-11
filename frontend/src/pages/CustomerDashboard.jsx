import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { reservationAPI } from '../services/api';
import StatsCard from '../components/ui/StatsCard';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelId, setCancelId] = useState(null);

  const fetchReservations = async () => {
    try {
      const res = await reservationAPI.getMy();
      setReservations(res.data.reservations);
    } catch (err) {
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await reservationAPI.cancel(cancelId);
      setCancelId(null);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const upcoming = reservations.filter(
    (r) => r.reservationStatus === 'confirmed' && new Date(r.reservationDate) >= today
  );
  const history = reservations.filter(
    (r) => r.reservationStatus !== 'confirmed' || new Date(r.reservationDate) < today
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" />
          <p className="text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container main-content">
      <ConfirmModal
        show={!!cancelId}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this reservation? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />

      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2><i className="bi bi-house me-2" style={{ color: 'var(--color-primary)' }}></i>Welcome, {user?.name}</h2>
          <p className="text-muted mb-0">Here's an overview of your reservations</p>
        </div>
        <Link to="/reservations/new" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>New Reservation
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatsCard
            icon="bi-calendar-check"
            label="Total Reservations"
            value={reservations.length}
            color="primary"
          />
        </div>
        <div className="col-md-4">
          <StatsCard
            icon="bi-arrow-up-circle"
            label="Upcoming"
            value={upcoming.length}
            color="success"
          />
        </div>
        <div className="col-md-4">
          <StatsCard
            icon="bi-clock-history"
            label="Past / Cancelled"
            value={history.length}
            color="secondary"
          />
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="card mb-4">
          <div className="card-header d-flex align-items-center gap-2">
            <i className="bi bi-calendar-event" style={{ color: 'var(--color-primary)' }}></i>
            <span className="fw-semibold">Upcoming Reservations</span>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Table</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((r) => (
                  <tr key={r._id} className="fade-in">
                    <td>
                      <i className="bi bi-calendar3 me-1 text-muted"></i>
                      {new Date(r.reservationDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td><span className="fw-medium">{r.timeSlot}:00</span></td>
                    <td>Table #{r.table?.tableNumber} <span className="text-muted">({r.table?.capacity} seats)</span></td>
                    <td>{r.guestCount}</td>
                    <td>
                      <span className={`badge bg-success`}>
                        <i className="bi bi-check-circle me-1"></i>{r.reservationStatus}
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-outline-danger btn-sm" onClick={() => setCancelId(r._id)}>
                        <i className="bi bi-x-circle me-1"></i>Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="card mb-4">
          <div className="card-header d-flex align-items-center gap-2">
            <i className="bi bi-clock-history" style={{ color: 'var(--color-text-muted)' }}></i>
            <span className="fw-semibold">Reservation History</span>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Table</th>
                  <th>Guests</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r._id} className="fade-in">
                    <td>
                      <i className="bi bi-calendar3 me-1 text-muted"></i>
                      {new Date(r.reservationDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td>{r.timeSlot}:00</td>
                    <td>Table #{r.table?.tableNumber} <span className="text-muted">({r.table?.capacity} seats)</span></td>
                    <td>{r.guestCount}</td>
                    <td>
                      <span className={`badge bg-${r.reservationStatus === 'cancelled' ? 'danger' : 'secondary'}`}>
                        <i className={`bi ${r.reservationStatus === 'cancelled' ? 'bi-x-circle' : 'bi-check-circle'} me-1`}></i>
                        {r.reservationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reservations.length === 0 && (
        <div className="card empty-state fade-in">
          <div className="empty-icon"><i className="bi bi-calendar-plus"></i></div>
          <h5>No reservations yet</h5>
          <p>Ready for a wonderful dining experience? Book your first table now.</p>
          <Link to="/reservations/new" className="btn btn-primary">
            <i className="bi bi-plus-lg me-1"></i>Make a Reservation
          </Link>
        </div>
      )}
    </div>
  );
}
