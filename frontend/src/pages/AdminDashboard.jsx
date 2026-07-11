import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import StatsCard from '../components/ui/StatsCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getDashboard();
        setStats(res.data);
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" />
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { to: '/admin/reservations', icon: 'bi-calendar-check', title: 'Manage Reservations', desc: 'View, filter, update, and cancel reservations', color: 'primary' },
    { to: '/admin/tables', icon: 'bi-grid-3x3-gap', title: 'Manage Tables', desc: 'Add, edit, and remove restaurant tables', color: 'success' },
    { to: '/admin/users', icon: 'bi-people', title: 'Manage Users', desc: 'View registered customers and admins', color: 'info' },
  ];

  return (
    <div className="container main-content">
      <div className="page-header">
        <h2><i className="bi bi-speedometer2 me-2" style={{ color: 'var(--color-primary)' }}></i>Admin Dashboard</h2>
        <p className="text-muted mb-0">Overview of restaurant operations</p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <StatsCard icon="bi-calendar-check" label="Total Reservations" value={stats?.totalReservations || 0} color="primary" />
        </div>
        <div className="col-md-3 col-6">
          <StatsCard icon="bi-calendar-day" label="Today's Reservations" value={stats?.todayReservations || 0} color="success" />
        </div>
        <div className="col-md-3 col-6">
          <StatsCard
            icon="bi-table"
            label="Available Tables"
            value={`${stats?.availableTables || 0}/${stats?.totalTables || 0}`}
            subtext="Tables not in maintenance"
            color="info"
          />
        </div>
        <div className="col-md-3 col-6">
          <StatsCard icon="bi-people" label="Total Users" value={stats?.totalUsers || 0} color="secondary" />
        </div>
        <div className="col-md-3 col-6">
          <StatsCard icon="bi-x-circle" label="Cancelled Reservations" value={stats?.cancelledReservations || 0} color="danger" />
        </div>
      </div>

      <h4 className="mb-3"><i className="bi bi-gear me-2" style={{ color: 'var(--color-primary)' }}></i>Quick Actions</h4>
      <div className="row g-3">
        {quickActions.map((action) => (
          <div className="col-md-4" key={action.to}>
            <Link to={action.to} className="text-decoration-none">
              <div className="card h-100 text-center p-3 fade-in">
                <div className="card-body">
                  <div className={`stat-icon mx-auto mb-3 bg-${action.color} bg-opacity-10 text-${action.color}`}>
                    <i className={`bi ${action.icon}`}></i>
                  </div>
                  <h5 className="card-title" style={{ fontFamily: 'var(--font-heading)' }}>{action.title}</h5>
                  <p className="card-text text-muted small">{action.desc}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
