import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { reservationAPI } from '../services/api';
import { ToastContext } from '../context/ToastContext';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function MyReservations() {
  const { addToast } = useContext(ToastContext);
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
      addToast('Reservation has been cancelled successfully', 'success', 'Cancelled');
      fetchReservations();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel', 'error', 'Error');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" />
          <p className="text-muted">Loading reservations...</p>
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
          <h2><i className="bi bi-list-check me-2" style={{ color: 'var(--color-primary)' }}></i>My Reservations</h2>
          <p className="text-muted mb-0">View and manage all your reservations</p>
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

      {reservations.length === 0 ? (
        <div className="card empty-state fade-in">
          <div className="empty-icon"><i className="bi bi-calendar-plus"></i></div>
          <h5>No reservations found</h5>
          <p>You haven't made any reservations yet. Book your first table now!</p>
          <Link to="/reservations/new" className="btn btn-primary">
            <i className="bi bi-plus-lg me-1"></i>Create Reservation
          </Link>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Table</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r._id} className="fade-in">
                    <td>
                      <i className="bi bi-calendar3 me-1 text-muted"></i>
                      {new Date(r.reservationDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td><span className="fw-medium">{r.timeSlot}:00</span></td>
                    <td>#{r.table?.tableNumber} <span className="text-muted">(Cap: {r.table?.capacity})</span></td>
                    <td>{r.guestCount}</td>
                    <td>
                      <span className={`badge bg-${r.reservationStatus === 'confirmed' ? 'success' : r.reservationStatus === 'cancelled' ? 'danger' : 'secondary'}`}>
                        <i className={`bi ${r.reservationStatus === 'confirmed' ? 'bi-check-circle' : r.reservationStatus === 'cancelled' ? 'bi-x-circle' : 'bi-dash-circle'} me-1`}></i>
                        {r.reservationStatus}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="text-end">
                      {r.reservationStatus === 'confirmed' && (
                        <button className="btn btn-outline-danger btn-sm" onClick={() => setCancelId(r._id)}>
                          <i className="bi bi-x-circle me-1"></i>Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
