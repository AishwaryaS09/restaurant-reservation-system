import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="col-lg-8 text-center">
          <i className="bi bi-shop" style={{ fontSize: '4rem', color: 'var(--color-primary)', opacity: 0.8 }}></i>
          <h1 className="display-4 fw-bold mt-3" style={{ fontFamily: 'var(--font-heading)' }}>
            La Maison
          </h1>
          <p className="lead text-muted mt-3" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Experience exceptional dining with effortless reservations.
            Book your table, manage your visits, and savor every moment.
          </p>
          {user ? (
            <div className="mt-4">
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                className="btn btn-primary btn-lg px-5"
              >
                <i className="bi bi-arrow-right-circle me-2"></i>
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="mt-4 d-flex gap-3 justify-content-center">
              <Link to="/login" className="btn btn-primary btn-lg px-4">
                <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
              </Link>
              <Link to="/register" className="btn btn-outline-primary btn-lg px-4">
                <i className="bi bi-person-plus me-2"></i>Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
