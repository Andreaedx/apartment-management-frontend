import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();

  const role = user?.role;

  const commonLinks = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "🏠",
    },
  ];

  const tenantLinks = [
    {
      label: "Apartments",
      path: "/apartments",
      icon: "🏢",
    },
    {
      label: "Tenancy",
      path: "/tenancy",
      icon: "📄",
    },
    {
      label: "Payments",
      path: "/payments",
      icon: "💳",
    },
    {
      label: "Invoices",
      path: "/invoices",
      icon: "🧾",
    },
    {
      label: "Maintenance",
      path: "/maintenance",
      icon: "🔧",
    },
  ];

  const managerLinks = [
    {
      label: "Apartments",
      path: "/apartments",
      icon: "🏢",
    },
    {
      label: "Properties",
      path: "/properties",
      icon: "🏗️",
    },
    {
      label: "Tenancies",
      path: "/tenancy",
      icon: "📄",
    },
    {
      label: "Payments",
      path: "/payments",
      icon: "💳",
    },
    {
      label: "Invoices",
      path: "/invoices",
      icon: "🧾",
    },
    {
      label: "Maintenance",
      path: "/maintenance",
      icon: "🔧",
    },
  ];

  const adminLinks = [
    {
      label: "Users",
      path: "/users",
      icon: "👥",
    },
    {
      label: "Properties",
      path: "/properties",
      icon: "🏗️",
    },
  ];

  let links = commonLinks;

  if (role === "tenant") {
    links = [...commonLinks, ...tenantLinks];
  }

  if (role === "manager") {
    links = [...commonLinks, ...managerLinks];
  }

  if (role === "admin") {
    links = [...commonLinks, ...adminLinks];
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-header">
        <h2>RENT A HOME</h2>

        <button
          className="dashboard-sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          ×
        </button>
      </div>

      <nav className="dashboard-sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onClose}
            className={({ isActive }) =>
              `dashboard-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="dashboard-sidebar-icon">
              {link.icon}
            </span>

            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="dashboard-sidebar-bottom">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            `dashboard-sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="dashboard-sidebar-icon">👤</span>
          <span>Profile</span>
        </NavLink>

        <button
          className="dashboard-logout-button"
          onClick={logout}
        >
          <span className="dashboard-sidebar-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;