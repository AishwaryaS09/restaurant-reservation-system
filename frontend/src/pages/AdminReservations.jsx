import { useState, useEffect, useContext } from 'react';
import { adminAPI } from '../services/api';
import { ToastContext } from '../context/ToastContext';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function AdminReservations() {
  const { addToast } = useContext(ToastContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  const fetchAll = async () => {
    try {
      const res = await adminAPI.getReservations();
      setReservations(res.data.reservations);
    } catch (err) {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const fetchByDate = async (date) => {
    try {
      const res = await adminAPI.getReservationsByDate(date);
      setReservations(res.data.reservations);
    } catch (err) {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateFilter) {
      fetchByDate(dateFilter);
    } else {
      fetchAll();
    }
  }, []);

  const handleFilter = () => {
    setLoading(true);
    setError('');
    if (dateFilter) {
      fetchByDate(dateFilter);
    } else {
      fetchAll();
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setEditForm({
      reservationStatus: r.reservationStatus,
      guestCount: r.guestCount,
      timeSlot: r.timeSlot,
    });
  };

  const handleUpdate = async (id) => {
    try {
      await adminAPI.updateReservation(id, editForm);
      setEditingId(null);
      addToast('Reservation updated successfully', 'success', 'Updated');
      handleFilter();
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error', 'Error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminAPI.deleteReservation(deleteId);
      setDeleteId(null);
      addToast('Reservation deleted permanently', 'success', 'Deleted');
      handleFilter();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error', 'Error');
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
        show={!!deleteId}
        title="Delete Reservation"
        message="Are you sure you want to permanently delete this reservation? This action cannot be undone."
        confirmLabel="Yes, Delete"
        confirmClass="btn-danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <div className="page-header">
        <h2><i className="bi bi-calendar-check me-2" style={{ color: 'var(--color-primary)' }}></i>All Reservations</h2>
        <p className="text-muted mb-0">Manage all restaurant reservations</p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="card p-3 mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Filter by Date</label>
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100" onClick={handleFilter}>
              <i className="bi bi-funnel me-1"></i>{dateFilter ? 'Filter' : 'Show All'}
            </button>
          </div>
          <div className="col-md-6 text-md-end text-muted small align-self-center">
            {reservations.length} reservation{reservations.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="card empty-state fade-in">
          <div className="empty-icon"><i className="bi bi-inbox"></i></div>
          <h5>No reservations found</h5>
          <p>{dateFilter ? 'No reservations for the selected date.' : 'No reservations in the system yet.'}</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Table</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r._id} className="fade-in">
                    <td className="fw-medium">{r.customer?.name}</td>
                    <td className="text-muted small">{r.customer?.email}</td>
                    <td>{new Date(r.reservationDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                    <td><span className="fw-medium">{r.timeSlot}:00</span></td>
                    <td>#{r.table?.tableNumber}</td>
                    <td>{r.guestCount}</td>
                    <td>
                      {editingId === r._id ? (
                        <select
                          className="form-select form-select-sm"
                          value={editForm.reservationStatus}
                          onChange={(e) => setEditForm({ ...editForm, reservationStatus: e.target.value })}
                          style={{ minWidth: '120px' }}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <span className={`badge bg-${r.reservationStatus === 'confirmed' ? 'success' : r.reservationStatus === 'cancelled' ? 'danger' : 'secondary'}`}>
                          {r.reservationStatus}
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      {editingId === r._id ? (
                        <div className="d-flex gap-1 justify-content-end">
                          <button className="btn btn-success btn-sm" onClick={() => handleUpdate(r._id)}>
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditingId(null)}>
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-1 justify-content-end">
                          <button className="btn btn-outline-warning btn-sm" onClick={() => startEdit(r)} title="Edit">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => setDeleteId(r._id)} title="Delete">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
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
