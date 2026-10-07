import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getDashboardData } from "../services/dashboardService";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="dashboard-stat-card">
      <div className="dashboard-stat-content">
        <p className="dashboard-stat-title">{title}</p>
        <h3>{value}</h3>

        {subtitle && (
          <p className="dashboard-stat-subtitle">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusClass = status
    ?.toLowerCase()
    .replace(/_/g, "-");

  return (
    <span
      className={`dashboard-status dashboard-status-${statusClass}`}
    >
      {status?.replace(/_/g, " ") || "N/A"}
    </span>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
  setLoading(true);
  setError("");

  const data = await getDashboardData(user?.role);

  setDashboard(data);
} catch (error) {
  console.error("DASHBOARD ERROR:", error);
  console.error("STATUS:", error.response?.status);
  console.error("URL:", error.config?.url);
  console.error("RESPONSE:", error.response?.data);

  setError(
    error.response?.data?.message ||
      `Dashboard request failed: ${
        error.config?.url || "unknown endpoint"
      }`
  );
} finally {
  setLoading(false);
}
    };

    if (user?.role) {
      loadDashboard();
    }
  }, [user?.role]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>Unable to load dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  /*
   * ADMIN DASHBOARD
   */
  if (user?.role === "admin") {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-welcome">
              Welcome back,
            </p>

            <h2>{user?.name}</h2>

            <p>
              Here's an overview of your apartment
              management system.
            </p>
          </div>

          <div className="dashboard-role">
            Administrator
          </div>
        </div>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>System Overview</h3>
          </div>

          <div className="dashboard-cards">
            <StatCard
              title="Total Properties"
              value={
                dashboard.propertyStats.total
              }
              subtitle="Registered properties"
            />

            <StatCard
              title="Total Apartments"
              value={
                dashboard.apartmentStats.total
              }
              subtitle="All apartments"
            />

            <StatCard
              title="Occupied Apartments"
              value={
                dashboard.apartmentStats.occupied
              }
              subtitle="Currently occupied"
            />

            <StatCard
              title="Maintenance Requests"
              value={
                dashboard.maintenanceStats.total
              }
              subtitle={`${dashboard.maintenanceStats.open} currently open`}
            />
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Apartment Status</h3>
          </div>

          <div className="dashboard-cards">
            <StatCard
              title="Vacant"
              value={
                dashboard.apartmentStats.vacant
              }
            />

            <StatCard
              title="Occupied"
              value={
                dashboard.apartmentStats.occupied
              }
            />

            <StatCard
              title="Maintenance"
              value={
                dashboard.apartmentStats.maintenance
              }
            />

            <StatCard
              title="Total"
              value={
                dashboard.apartmentStats.total
              }
            />
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Recent Users</h3>
          </div>

          <div className="dashboard-table-wrapper">
            {dashboard.users.length === 0 ? (
              <div className="dashboard-empty">
                No users found.
              </div>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Email Status</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.users
                    .slice(0, 10)
                    .map((userItem) => (
                      <tr key={userItem._id}>
                        <td>{userItem.name}</td>

                        <td>{userItem.email}</td>

                        <td>
                          <StatusBadge
                            status={
                              userItem.role
                            }
                          />
                        </td>

                        <td>
                          {userItem.isEmailVerified
                            ? "Verified"
                            : "Unverified"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Maintenance Overview</h3>
          </div>

          <div className="dashboard-cards">
            <StatCard
              title="Open"
              value={
                dashboard.maintenanceStats.open
              }
            />

            <StatCard
              title="In Progress"
              value={
                dashboard.maintenanceStats
                  .inProgress
              }
            />

            <StatCard
              title="Resolved"
              value={
                dashboard.maintenanceStats.resolved
              }
            />

            <StatCard
              title="Urgent"
              value={
                dashboard.maintenanceStats.urgent
              }
            />
          </div>
        </section>
      </div>
    );
  }

  /*
   * MANAGER DASHBOARD
   */
  if (user?.role === "manager") {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-welcome">
              Welcome back,
            </p>

            <h2>{user?.name}</h2>

            <p>
              Here's what's happening with your
              properties today.
            </p>
          </div>

          <div className="dashboard-role">
            Property Manager
          </div>
        </div>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Property Overview</h3>
          </div>

          <div className="dashboard-cards">
            <StatCard
              title="Properties"
              value={
                dashboard.propertyStats.total
              }
              subtitle="Your properties"
            />

            <StatCard
              title="Apartments"
              value={
                dashboard.apartmentStats.total
              }
              subtitle="Total apartments"
            />

            <StatCard
              title="Active Tenancies"
              value={
                dashboard.tenancyStats.active
              }
              subtitle="Currently active"
            />

            <StatCard
              title="Vacant Apartments"
              value={
                dashboard.apartmentStats.vacant
              }
              subtitle="Available units"
            />
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Financial Overview</h3>
          </div>

          <div className="dashboard-cards">
            <StatCard
              title="Total Invoiced"
              value={formatCurrency(
                dashboard.invoiceStats.totalAmount
              )}
              subtitle={`${dashboard.invoiceStats.total} invoices`}
            />

            <StatCard
              title="Total Payments"
              value={formatCurrency(
                dashboard.paymentStats.totalAmount
              )}
              subtitle={`${dashboard.paymentStats.successful} successful payments`}
            />

            <StatCard
              title="Paid Invoices"
              value={
                dashboard.invoiceStats.paid
              }
              subtitle="Fully paid"
            />

            <StatCard
              title="Overdue"
              value={
                dashboard.invoiceStats.overdue
              }
              subtitle="Requires attention"
            />
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Maintenance</h3>
          </div>

          <div className="dashboard-cards">
            <StatCard
              title="Total Requests"
              value={
                dashboard.maintenanceStats.total
              }
            />

            <StatCard
              title="Open"
              value={
                dashboard.maintenanceStats.open
              }
            />

            <StatCard
              title="In Progress"
              value={
                dashboard.maintenanceStats
                  .inProgress
              }
            />

            <StatCard
              title="Urgent"
              value={
                dashboard.maintenanceStats.urgent
              }
            />
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Recent Maintenance Requests</h3>
          </div>

          <div className="dashboard-list">
            {dashboard.maintenanceRequests
              .slice(0, 5)
              .map((request) => (
                <div
                  className="dashboard-list-item"
                  key={request._id}
                >
                  <div>
                    <h4>{request.title}</h4>

                    <p>
                      Apartment{" "}
                      {request.apartment
                        ?.apartmentNumber ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="dashboard-list-right">
                    <StatusBadge
                      status={request.status}
                    />

                    <span className="dashboard-date">
                      {formatDate(
                        request.createdAt
                      )}
                    </span>
                  </div>
                </div>
              ))}

            {dashboard.maintenanceRequests
              .length === 0 && (
              <div className="dashboard-empty">
                No maintenance requests found.
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  /*
   * TENANT DASHBOARD
   */
  const activeTenancies =
    dashboard.tenancies.filter(
      (tenancy) =>
        tenancy.status === "ACTIVE"
    );

  const activeTenancy =
    activeTenancies[0];

  const openMaintenance =
    dashboard.maintenanceRequests.filter(
      (request) =>
        request.status === "OPEN" ||
        request.status === "IN_PROGRESS"
    );

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-welcome">
            Welcome back,
          </p>

          <h2>{user?.name}</h2>

          <p>
            Here's an overview of your tenancy
            and payments.
          </p>
        </div>

        <div className="dashboard-role">
          Tenant
        </div>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>My Overview</h3>
        </div>

        <div className="dashboard-cards">
          <StatCard
            title="Active Tenancy"
            value={
              activeTenancy ? "Active" : "None"
            }
            subtitle={
              activeTenancy
                ? "Current tenancy"
                : "No active tenancy"
            }
          />

          <StatCard
            title="Monthly Rent"
            value={
              activeTenancy
                ? formatCurrency(
                    activeTenancy.rentAmount
                  )
                : formatCurrency(0)
            }
            subtitle="Current rent amount"
          />

          <StatCard
            title="Invoices"
            value={
              dashboard.invoiceStats.total
            }
            subtitle={`${dashboard.invoiceStats.paid} paid`}
          />

          <StatCard
            title="Open Maintenance"
            value={openMaintenance.length}
            subtitle="Requests requiring attention"
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>My Apartment</h3>
        </div>

        {activeTenancy?.apartment ? (
          <div className="dashboard-detail-card">
            <div>
              <p className="dashboard-detail-label">
                Apartment
              </p>

              <h3>
                Apartment{" "}
                {
                  activeTenancy.apartment
                    .apartmentNumber
                }
              </h3>
            </div>

            <div>
              <p className="dashboard-detail-label">
                Type
              </p>

              <p>
                {
                  activeTenancy.apartment
                    .type
                }
              </p>
            </div>

            <div>
              <p className="dashboard-detail-label">
                Rent
              </p>

              <p>
                {formatCurrency(
                  activeTenancy.rentAmount
                )}
              </p>
            </div>

            <div>
              <p className="dashboard-detail-label">
                Tenancy Status
              </p>

              <StatusBadge
                status={
                  activeTenancy.status
                }
              />
            </div>
          </div>
        ) : (
          <div className="dashboard-empty">
            You currently do not have an active
            tenancy.
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>Invoice Overview</h3>
        </div>

        <div className="dashboard-cards">
          <StatCard
            title="Total Invoiced"
            value={formatCurrency(
              dashboard.invoiceStats.totalAmount
            )}
          />

          <StatCard
            title="Paid"
            value={
              dashboard.invoiceStats.paid
            }
          />

          <StatCard
            title="Unpaid"
            value={
              dashboard.invoiceStats.unpaid
            }
          />

          <StatCard
            title="Overdue"
            value={
              dashboard.invoiceStats.overdue
            }
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>Maintenance Requests</h3>
        </div>

        <div className="dashboard-list">
          {dashboard.maintenanceRequests
            .slice(0, 5)
            .map((request) => (
              <div
                className="dashboard-list-item"
                key={request._id}
              >
                <div>
                  <h4>{request.title}</h4>

                  <p>
                    {request.description}
                  </p>
                </div>

                <div className="dashboard-list-right">
                  <StatusBadge
                    status={request.status}
                  />

                  <span className="dashboard-date">
                    {formatDate(
                      request.createdAt
                    )}
                  </span>
                </div>
              </div>
            ))}

          {dashboard.maintenanceRequests
            .length === 0 && (
            <div className="dashboard-empty">
              You have no maintenance requests.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;