import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-shop me-2"></i>La Maison
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <>
                    <li className="nav-item">
                      <Link className={`nav-link nav-link-custom ${isActive('/admin/dashboard') ? 'active' : ''}`} to="/admin/dashboard">
                        <i className="bi bi-speedometer2"></i> Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link nav-link-custom ${isActive('/admin/reservations') ? 'active' : ''}`} to="/admin/reservations">
                        <i className="bi bi-calendar-check"></i> Reservations
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link nav-link-custom ${isActive('/admin/tables') ? 'active' : ''}`} to="/admin/tables">
                        <i className="bi bi-grid"></i> Tables
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link nav-link-custom ${isActive('/admin/users') ? 'active' : ''}`} to="/admin/users">
                        <i className="bi bi-people"></i> Users
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className={`nav-link nav-link-custom ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard">
                        <i className="bi bi-house"></i> Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link nav-link-custom ${isActive('/reservations/new') ? 'active' : ''}`} to="/reservations/new">
                        <i className="bi bi-plus-circle"></i> New Reservation
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link nav-link-custom ${isActive('/reservations/my') ? 'active' : ''}`} to="/reservations/my">
                        <i className="bi bi-list-check"></i> My Reservations
                      </Link>
                    </li>
                  </>
                )}
                <li className="nav-item ms-lg-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-light small d-none d-lg-inline">
                      <i className="bi bi-person-circle me-1"></i>{user.name}
                    </span>
                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-1"></i>Logout
                    </button>
                  </div>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive('/login') ? 'active' : ''}`} to="/login">
                    <i className="bi bi-box-arrow-in-right"></i> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive('/register') ? 'active' : ''}`} to="/register">
                    <i className="bi bi-person-plus"></i> Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
