import { useAuth } from "../../context/AuthContext";

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="dashboard-topbar">
      <button
        className="dashboard-menu-button"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        ☰
      </button>

      <div className="dashboard-topbar-title">
        <h1>Dashboard</h1>
      </div>

      <div className="dashboard-topbar-user">
        <div className="dashboard-user-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <div className="dashboard-user-info">
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;