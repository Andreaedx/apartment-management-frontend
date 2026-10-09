import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Modal from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import { getTenancies } from "../services/tenancyService";
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  updateMaintenanceStatus,
} from "../services/maintenanceService";

const Maintenance = () => {
  const { user } = useAuth();
  const canCreate = user?.role === "tenant";
  const canManageStatus = user?.role === "manager";
  const [requests, setRequests] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState({ apartment:"", title:"", description:"", priority:"MEDIUM" });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Bumped after a save or status change to fetch the list again
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await getMaintenanceRequests();
        if (cancelled) return;
        setRequests(response.data?.data || []);

        // A tenant can only raise requests for apartments they currently rent
        if (canCreate) {
          const tenancyResponse = await getTenancies({ status: "ACTIVE" });
          if (cancelled) return;
          setApartments(
            (tenancyResponse.data?.data || [])
              .map((tenancy) => tenancy.apartment)
              .filter(Boolean)
          );
        }
        setError("");
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Failed to load maintenance requests.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [canCreate, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        await updateMaintenanceRequest(editing._id, {
          title: form.title,
          description: form.description,
          priority: form.priority,
        });
      } else {
        await createMaintenanceRequest(form);
      }
      setShowForm(false);
      setEditing(null);
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save maintenance request.");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (request) => {
    const next = request.status === "OPEN" ? "IN_PROGRESS" : "RESOLVED";
    try {
      await updateMaintenanceStatus(request._id, next);
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <div className="content-page">
      <PageHeader title="Maintenance" description="Track and manage apartment maintenance requests." action={canCreate ? <button className="primary-button" onClick={() => { setEditing(null); setForm({apartment:"",title:"",description:"",priority:"MEDIUM"}); setShowForm(true); }}>New Request</button> : null} />
      {error && <div className="alert error">{error}</div>}
      {loading ? <div className="page-state">Loading requests...</div> : (
        <div className="data-card">
          {requests.length === 0 ? <div className="page-state">No maintenance requests found.</div> : (
            <div className="table-scroll"><table className="data-table">
              <thead><tr><th>Title</th><th>Apartment</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>{requests.map((r) => (
                <tr key={r._id}>
                  <td>{r.title}</td>
                  <td>{r.apartment?.apartmentNumber || "—"}</td>
                  <td><span className={`status-badge ${r.priority.toLowerCase()}`}>{r.priority}</span></td>
                  <td><span className={`status-badge ${r.status.toLowerCase()}`}>{r.status.replace("_"," ")}</span></td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    {canManageStatus && r.status !== "RESOLVED" && <button className="secondary-button" onClick={() => changeStatus(r)}>{r.status === "OPEN" ? "Start" : "Resolve"}</button>}
                    {canCreate && r.status === "OPEN" && <button className="secondary-button" onClick={() => { setEditing(r); setForm({apartment:r.apartment?._id || "",title:r.title,description:r.description,priority:r.priority}); setShowForm(true); }}>Edit</button>}
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>
      )}

      {showForm && <Modal title={editing ? "Edit Request" : "New Maintenance Request"} onClose={() => setShowForm(false)}>
        <form className="form-grid" onSubmit={submit}>
          {!editing && <label className="full">Apartment<select required value={form.apartment} onChange={(e) => setForm({...form, apartment:e.target.value})}><option value="">Select apartment</option>{apartments.map((a) => <option key={a._id} value={a._id}>Apartment {a.apartmentNumber}</option>)}</select></label>}
          <label className="full">Title<input required value={form.title} onChange={(e) => setForm({...form,title:e.target.value})} /></label>
          <label className="full">Description<textarea required rows="4" value={form.description} onChange={(e) => setForm({...form,description:e.target.value})} /></label>
          <label>Priority<select value={form.priority} onChange={(e) => setForm({...form,priority:e.target.value})}>{["LOW","MEDIUM","HIGH","URGENT"].map((p) => <option key={p}>{p}</option>)}</select></label>
          <div className="form-actions full"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save Request"}</button></div>
        </form>
      </Modal>}
    </div>
  );
};

export default Maintenance;
