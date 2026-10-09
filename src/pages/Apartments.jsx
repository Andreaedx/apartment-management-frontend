import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Modal from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import { getProperties } from "../services/propertyService";
import {
  getApartments,
  createApartment,
  updateApartment,
  deleteApartment,
} from "../services/apartmentService";

const emptyForm = {
  property: "",
  apartmentNumber: "",
  type: "1-BEDROOM",
  rentAmount: "",
  status: "VACANT",
  description: "",
};

const Apartments = () => {
  const { user } = useAuth();
  const [apartments, setApartments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Bumped after a save or delete to fetch the list again
  const [reloadKey, setReloadKey] = useState(0);

  const canManage = user?.role === "manager";
  const userId = user?._id || user?.id;

  // Managers can only add apartments to properties they manage
  const ownProperties = properties.filter(
    (p) => (p.manager?._id || p.manager) === userId
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [apartmentsResponse, propertiesResponse] = await Promise.all([
          getApartments(),
          getProperties(),
        ]);
        if (cancelled) return;
        setApartments(apartmentsResponse.data?.data || []);
        setProperties(propertiesResponse.data?.data?.properties || []);
        setError("");
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Failed to load apartments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const openCreate = () => {
    setEditing(null);
    setForm({...emptyForm, property: ownProperties[0]?._id || ""});
    setShowForm(true);
  };

  const openEdit = (apartment) => {
    setEditing(apartment);
    setForm({
      property: apartment.property?._id || apartment.property || "",
      apartmentNumber: apartment.apartmentNumber || "",
      type: apartment.type || "1-BEDROOM",
      rentAmount: apartment.rentAmount || "",
      status: apartment.status || "VACANT",
      description: apartment.description || "",
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        await updateApartment(editing._id, {
          apartmentNumber: form.apartmentNumber,
          type: form.type,
          rentAmount: Number(form.rentAmount),
          status: form.status,
          description: form.description,
        });
      } else {
        // Sent as JSON (no images here) so rentAmount stays a number;
        // FormData would turn it into text and the API rejects it
        await createApartment({
          property: form.property,
          apartmentNumber: form.apartmentNumber,
          type: form.type,
          rentAmount: Number(form.rentAmount),
          status: form.status,
          description: form.description,
        });
      }
      setShowForm(false);
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save apartment.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this apartment?")) return;
    try {
      await deleteApartment(id);
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete apartment.");
    }
  };

  return (
    <div className="content-page">
      <PageHeader
        title="Apartments"
        description="Manage apartment units, rent and availability."
        action={canManage ? <button className="primary-button" onClick={openCreate}>Add Apartment</button> : null}
      />
      {error && <div className="alert error">{error}</div>}
      {loading ? <div className="page-state">Loading apartments...</div> : (
        <div className="data-card">
          {apartments.length === 0 ? <div className="page-state">No apartments found.</div> : (
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Apartment</th><th>Property</th><th>Type</th><th>Rent</th><th>Status</th>{canManage && <th>Actions</th>}</tr></thead>
                <tbody>
                  {apartments.map((apartment) => (
                    <tr key={apartment._id}>
                      <td>{apartment.apartmentNumber}</td>
                      <td>{apartment.property?.name || "—"}</td>
                      <td>{apartment.type}</td>
                      <td>₦{Number(apartment.rentAmount || 0).toLocaleString()}</td>
                      <td><span className={`status-badge ${apartment.status.toLowerCase()}`}>{apartment.status}</span></td>
                      {canManage && <td className="actions"><button className="secondary-button" onClick={() => openEdit(apartment)}>Edit</button><button className="danger-button" onClick={() => remove(apartment._id)}>Delete</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Edit Apartment" : "Add Apartment"} onClose={() => setShowForm(false)}>
          <form className="form-grid" onSubmit={submit}>
            {!editing && (
              <label>Property
                <select required value={form.property} onChange={(e) => setForm({...form, property: e.target.value})}>
                  <option value="">Select property</option>
                  {ownProperties.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </label>
            )}
            <label>Apartment Number<input required value={form.apartmentNumber} onChange={(e) => setForm({...form, apartmentNumber: e.target.value})} /></label>
            <label>Type<select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
              {["1-BEDROOM","2-BEDROOM","3-BEDROOM","4-BEDROOM"].map((x) => <option key={x}>{x}</option>)}
            </select></label>
            <label>Rent Amount<input type="number" min="0" required value={form.rentAmount} onChange={(e) => setForm({...form, rentAmount: e.target.value})} /></label>
            <label>Status<select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
              {["VACANT","OCCUPIED","MAINTENANCE"].map((x) => <option key={x}>{x}</option>)}
            </select></label>
            <label className="full">Description<textarea rows="4" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></label>
            <div className="form-actions full"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save Apartment"}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Apartments;
