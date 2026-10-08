// Shared two-column layout for the authentication pages
const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="auth-layout">
      <aside className="auth-brand">
        <div className="auth-brand-inner">
          <span className="auth-brand-logo">RENT A HOME</span>

          <h2 className="auth-brand-heading">
            Apartment living, managed in one place.
          </h2>

          <ul className="auth-brand-points">
            <li>Find and manage apartments</li>
            <li>Pay rent and track invoices</li>
            <li>Raise and follow maintenance requests</li>
          </ul>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <header className="auth-card-header">
            <h1>{title}</h1>

            {subtitle && <p>{subtitle}</p>}
          </header>

          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
