import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Modal from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import { getTenants } from "../services/userService";
import { getApartments } from "../services/apartmentService";
import {
  getTenancies,
  createTenancy,
  updateTenancy,
  endTenancy,
} from "../services/tenancyService";

const Tenancy = () => {
  const { user } = useAuth();
  const [tenancies, setTenancies] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState({ tenant: "", apartment: "", startDate: "", endDate: "", rentAmount: "" });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  // Bumped after a save or end to fetch the list again
  const [reloadKey, setReloadKey] = useState(0);

  const canManage = user?.role === "manager";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const tenancyResponse = await getTenancies({ page: 1, limit: 100 });
        if (cancelled) return;
        setTenancies(tenancyResponse.data?.data || []);
        setError("");
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Failed to load tenancies.");
      } finally {
        if (!cancelled) setLoading(false);
      }

      // Form options are loaded separately so a failure here can't hide the list
      if (canManage) {
        try {
          const [tenantsResponse, apartmentResponse] = await Promise.all([
            getTenants(),
            getApartments(),
          ]);
          if (cancelled) return;
          setTenants(tenantsResponse.data?.users || []);
          setApartments(apartmentResponse.data?.data || []);
        } catch (err) {
          if (!cancelled) setError(err.response?.data?.message || "Failed to load tenants and apartments.");
        }
      }
    };

    load();

    return () => { cancelled = true; };
  }, [canManage, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        await updateTenancy(editing._id, {
          startDate: form.startDate,
          endDate: form.endDate,
          rentAmount: Number(form.rentAmount),
        });
      } else {
        await createTenancy({
          tenant: form.tenant,
          apartment: form.apartment,
          startDate: form.startDate,
          endDate: form.endDate,
          rentAmount: Number(form.rentAmount),
        });
      }
      setShowForm(false);
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save tenancy.");
    } finally {
      setSaving(false);
    }
  };

  const finish = async (id) => {
    if (!window.confirm("End this tenancy?")) return;
    try {
      await endTenancy(id);
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to end tenancy.");
    }
  };

  return (
    <div className="content-page">
      <PageHeader
        title="Tenancy"
        description={canManage ? "Manage tenant agreements and occupancy." : "View your tenancy information."}
        action={canManage ? <button className="primary-button" onClick={() => { setEditing(null); setForm({tenant:"",apartment:"",startDate:"",endDate:"",rentAmount:""}); setShowForm(true); }}>Create Tenancy</button> : null}
      />
      {error && <div className="alert error">{error}</div>}
      {loading ? <div className="page-state">Loading tenancies...</div> : (
        <div className="data-card">
          {tenancies.length === 0 ? <div className="page-state">No tenancies found.</div> : (
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Tenant</th><th>Apartment</th><th>Start</th><th>End</th><th>Rent</th><th>Status</th>{canManage && <th>Actions</th>}</tr></thead>
                <tbody>
                  {tenancies.map((t) => (
                    <tr key={t._id}>
                      <td>{t.tenant?.name || "—"}</td>
                      <td>{t.apartment?.apartmentNumber || "—"}</td>
                      <td>{new Date(t.startDate).toLocaleDateString()}</td>
                      <td>{new Date(t.endDate).toLocaleDateString()}</td>
                      <td>₦{Number(t.rentAmount || 0).toLocaleString()}</td>
                      <td><span className={`status-badge ${t.status.toLowerCase()}`}>{t.status}</span></td>
                      {canManage && <td className="actions"><button className="secondary-button" onClick={() => { setEditing(t); setForm({tenant:t.tenant?._id || "",apartment:t.apartment?._id || "",startDate:t.startDate?.slice(0,10) || "",endDate:t.endDate?.slice(0,10) || "",rentAmount:t.rentAmount || ""}); setShowForm(true); }}>Edit</button>{t.status === "ACTIVE" && <button className="danger-button" onClick={() => finish(t._id)}>End</button>}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Edit Tenancy" : "Create Tenancy"} onClose={() => setShowForm(false)}>
          <form className="form-grid" onSubmit={submit}>
            {!editing && <>
              <label>Tenant<select required value={form.tenant} onChange={(e) => setForm({...form, tenant:e.target.value})}><option value="">Select tenant</option>{tenants.map((t) => <option key={t._id} value={t._id}>{t.name} — {t.email}</option>)}</select></label>
              <label>Apartment<select required value={form.apartment} onChange={(e) => setForm({...form, apartment:e.target.value})}><option value="">Select apartment</option>{apartments.filter((a) => a.status === "VACANT").map((a) => <option key={a._id} value={a._id}>{a.apartmentNumber} — {a.property?.name || ""}</option>)}</select></label>
            </>}
            <label>Start Date<input type="date" required value={form.startDate} onChange={(e) => setForm({...form, startDate:e.target.value})} /></label>
            <label>End Date<input type="date" required value={form.endDate} onChange={(e) => setForm({...form, endDate:e.target.value})} /></label>
            <label>Rent Amount<input type="number" min="0" required value={form.rentAmount} onChange={(e) => setForm({...form, rentAmount:e.target.value})} /></label>
            <div className="form-actions full"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save Tenancy"}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Tenancy;
