import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container">
      <div className="row justify-content-center align-items-center text-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="col-md-6">
          <div className="display-1 fw-bold" style={{ color: 'var(--color-primary)', opacity: 0.3 }}>404</div>
          <h2 className="mt-3" style={{ fontFamily: 'var(--font-heading)' }}>Page Not Found</h2>
          <p className="text-muted mt-2">The page you're looking for doesn't exist or has been moved.</p>
          <Link to="/" className="btn btn-primary mt-3">
            <i className="bi bi-house me-1"></i>Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
