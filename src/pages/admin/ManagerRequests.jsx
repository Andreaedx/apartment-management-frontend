import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getManagerRequests,
  reviewManagerRequest,
} from "../../services/userService";

const STATUSES = ["PENDING", "APPROVED", "REJECTED"];

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ManagerRequests = () => {
  const { user } = useAuth();

  const [status, setStatus] = useState("PENDING");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (user?.role !== "admin") return;

    // Ignore a response that arrives after the filter has changed
    let cancelled = false;

    const loadRequests = async () => {
      try {
        const response = await getManagerRequests(status);

        if (!cancelled) {
          setRequests(response.data.users || []);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error.response?.data?.message ||
              "Unable to load manager requests."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, [user?.role, status]);

  const handleStatusChange = (event) => {
    setLoading(true);
    setError("");
    setMessage("");
    setStatus(event.target.value);
  };

  const handleReview = async (request, action) => {
    const verb = action === "approve" ? "Approve" : "Reject";

    if (!window.confirm(`${verb} ${request.name} as a property manager?`)) {
      return;
    }

    setBusyId(request._id);
    setError("");
    setMessage("");

    try {
      const response = await reviewManagerRequest(request._id, action);

      setMessage(response.data?.message || "Request updated.");

      // The request is no longer pending, so drop it from this list
      setRequests((previous) =>
        previous.filter((item) => item._id !== request._id)
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update this request."
      );
    } finally {
      setBusyId(null);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="dashboard-error">
        <h3>Access denied</h3>
        <p>Only administrators can review manager requests.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2>Manager Requests</h2>

          <p>
            People who registered as property managers. Approving
            gives them manager access straight away.
          </p>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>
            {status.charAt(0) + status.slice(1).toLowerCase()} requests
          </h3>

          <select
            value={status}
            onChange={handleStatusChange}
            aria-label="Filter by status"
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0) + item.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <p className="manager-requests-message">{message}</p>
        )}

        {error && (
          <p className="manager-requests-error">{error}</p>
        )}

        <div className="dashboard-table-wrapper">
          {loading ? (
            <div className="dashboard-empty">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="dashboard-empty">
              No {status.toLowerCase()} requests.
            </div>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Email verified</th>
                  <th>Requested</th>
                  <th>Status</th>
                  {status === "PENDING" && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.name}</td>
                    <td>{request.email}</td>
                    <td>{request.isEmailVerified ? "Yes" : "Not yet"}</td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>
                      <span className="dashboard-status">
                        {request.managerRequest.toLowerCase()}
                      </span>
                    </td>

                    {status === "PENDING" && (
                      <td>
                        <div className="manager-requests-actions">
                          <button
                            className="manager-requests-approve"
                            onClick={() => handleReview(request, "approve")}
                            disabled={
                              busyId === request._id ||
                              !request.isEmailVerified
                            }
                            title={
                              request.isEmailVerified
                                ? "Approve"
                                : "They must verify their email first"
                            }
                          >
                            Approve
                          </button>

                          <button
                            className="manager-requests-reject"
                            onClick={() => handleReview(request, "reject")}
                            disabled={busyId === request._id}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default ManagerRequests;
