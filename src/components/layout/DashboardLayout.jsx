import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = () => {
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
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;