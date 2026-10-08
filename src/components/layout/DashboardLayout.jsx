import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";

// Shown to tenants who asked for a manager account
const ManagerRequestNotice = ({ managerRequest, role }) => {
  if (role !== "tenant") return null;

  if (managerRequest === "PENDING") {
    return (
      <div className="manager-request-notice">
        Your manager account request is awaiting admin approval.
        You can use the app as a tenant until then.
      </div>
    );
  }

  if (managerRequest === "REJECTED") {
    return (
      <div className="manager-request-notice manager-request-notice-rejected">
        Your manager account request was not approved. Contact the
        administrator if you think this is a mistake.
      </div>
    );
  }

  return null;
};

const DashboardLayout = () => {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div
          className="dashboard-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <div
        className={`dashboard-sidebar-container ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <Sidebar onClose={closeSidebar} />
      </div>

      <main className="dashboard-main">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <section className="dashboard-content">
          <ManagerRequestNotice
            managerRequest={user?.managerRequest}
            role={user?.role}
          />

          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;