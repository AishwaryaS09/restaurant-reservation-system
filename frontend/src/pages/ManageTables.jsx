import { useState, useEffect, useContext } from 'react';
import { tableAPI } from '../services/api';
import { ToastContext } from '../context/ToastContext';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function ManageTables() {
  const { addToast } = useContext(ToastContext);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: '', status: 'available' });
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchTables = async () => {
    try {
      const res = await tableAPI.getAll();
      setTables(res.data.tables);
    } catch (err) {
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await tableAPI.update(editing, {
          tableNumber: parseInt(form.tableNumber),
          capacity: parseInt(form.capacity),
          status: form.status,
        });
        addToast('Table updated successfully', 'success', 'Updated');
      } else {
        await tableAPI.create(form);
        addToast('New table added successfully', 'success', 'Created');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ tableNumber: '', capacity: '', status: 'available' });
      fetchTables();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error', 'Error');
    }
  };

  const handleEdit = (table) => {
    setEditing(table._id);
    setForm({
      tableNumber: String(table.tableNumber),
      capacity: String(table.capacity),
      status: table.status,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await tableAPI.delete(deleteId);
      setDeleteId(null);
      addToast('Table deleted successfully', 'success', 'Deleted');
      fetchTables();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error', 'Error');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" />
          <p className="text-muted">Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container main-content">
      <ConfirmModal
        show={!!deleteId}
        title="Delete Table"
        message="Are you sure you want to delete this table? This action cannot be undone."
        confirmLabel="Yes, Delete"
        confirmClass="btn-danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2><i className="bi bi-grid me-2" style={{ color: 'var(--color-primary)' }}></i>Manage Tables</h2>
          <p className="text-muted mb-0">Configure restaurant seating</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            setForm({ tableNumber: '', capacity: '', status: 'available' });
          }}
        >
          <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
          {showForm ? 'Cancel' : 'Add Table'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <div className="card mb-4 fade-in">
          <div className="card-header">
            <i className="bi bi-pencil-square me-1" style={{ color: 'var(--color-primary)' }}></i>
            {editing ? 'Edit Table' : 'Add New Table'}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Table Number</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.tableNumber}
                    onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                    min="1"
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Capacity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    min="1"
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button type="submit" className="btn btn-success w-100">
                    <i className="bi bi-check-lg me-1"></i>
                    {editing ? 'Update Table' : 'Create Table'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Table #</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table._id} className="fade-in">
                  <td className="fw-medium">#{table.tableNumber}</td>
                  <td>{table.capacity} <span className="text-muted">seats</span></td>
                  <td>
                    <span className={`badge bg-${table.status === 'available' ? 'success' : table.status === 'reserved' ? 'warning' : 'secondary'}`}>
                      {table.status}
                    </span>
                  </td>
                  <td className="text-muted small">
                    {new Date(table.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="text-end">
                    <button className="btn btn-outline-warning btn-sm me-1" onClick={() => handleEdit(table)} title="Edit">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => setDeleteId(table._id)} title="Delete">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
