import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Page titles by route, matching the sidebar labels
const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/properties": "Properties",
  "/apartments": "Apartments",
  "/payments": "Payments",
  "/invoices": "Invoices",
  "/maintenance": "Maintenance",
  "/users": "Users",
  "/profile": "Profile",
  "/manager-requests": "Manager Requests",
};

const getPageTitle = (pathname, role) => {
  if (pathname === "/tenancy") {
    return role === "tenant" ? "Tenancy" : "Tenancies";
  }

  if (pathname.startsWith("/properties/")) return "Property Details";
  if (pathname.startsWith("/apartments/")) return "Apartment Details";

  return PAGE_TITLES[pathname] || "Dashboard";
};

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

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
        <h1>{getPageTitle(pathname, user?.role)}</h1>
      </div>

      <div className="dashboard-topbar-user">
        <div className="dashboard-user-avatar">
          {user?.profilePicture?.url ? (
            <img src={user.profilePicture.url} alt="" />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
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
