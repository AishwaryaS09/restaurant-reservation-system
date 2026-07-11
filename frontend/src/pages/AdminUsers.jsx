import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminAPI.getUsers();
        setUsers(res.data.users);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" />
          <p className="text-muted">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container main-content">
      <div className="page-header">
        <h2><i className="bi bi-people me-2" style={{ color: 'var(--color-primary)' }}></i>Users</h2>
        <p className="text-muted mb-0">All registered users in the system</p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {users.length === 0 ? (
        <div className="card empty-state fade-in">
          <div className="empty-icon"><i className="bi bi-people"></i></div>
          <h5>No users found</h5>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="fade-in">
                    <td className="fw-medium">
                      <i className="bi bi-person-circle me-2 text-muted"></i>
                      {u.name}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge bg-${u.role === 'admin' ? 'primary' : 'secondary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
