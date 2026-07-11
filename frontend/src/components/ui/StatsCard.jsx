export default function StatsCard({ icon, label, value, subtext, color }) {
  const bgMap = {
    primary: 'bg-primary bg-opacity-10 text-primary',
    success: 'bg-success bg-opacity-10 text-success',
    danger: 'bg-danger bg-opacity-10 text-danger',
    warning: 'bg-warning bg-opacity-10 text-warning',
    info: 'bg-info bg-opacity-10 text-info',
    secondary: 'bg-secondary bg-opacity-10 text-secondary',
  };

  return (
    <div className="stat-card fade-in">
      <div className={`stat-icon ${bgMap[color] || bgMap.primary}`}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="stat-label">{label}</div>
      <p className="stat-value">{value}</p>
      {subtext && <small className="text-muted">{subtext}</small>}
    </div>
  );
}
