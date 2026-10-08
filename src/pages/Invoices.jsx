import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Modal from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import { getTenancies } from "../services/tenancyService";
import { getInvoices, createInvoice } from "../services/invoiceService";

const Invoices = () => {
  const { user } = useAuth();
  const canCreate = user?.role === "manager";
  const [invoices, setInvoices] = useState([]);
  const [tenancies, setTenancies] = useState([]);
  const [form, setForm] = useState({ tenancy: "", amount: "", dueDate: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const invoiceResponse = await getInvoices();
      setInvoices(invoiceResponse.data?.data || []);
      if (canCreate) {
        const tenancyResponse = await getTenancies({ page: 1, limit: 100 });
        setTenancies((tenancyResponse.data?.data || []).filter((t) => t.status === "ACTIVE"));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [canCreate]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createInvoice({ tenancy: form.tenancy, amount: Number(form.amount), dueDate: form.dueDate });
      setShowForm(false);
      setForm({ tenancy:"", amount:"", dueDate:"" });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create invoice.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-page">
      <PageHeader title="Invoices" description="Track rent invoices and their payment status." action={canCreate ? <button className="primary-button" onClick={() => setShowForm(true)}>Create Invoice</button> : null} />
      {error && <div className="alert error">{error}</div>}
      {loading ? <div className="page-state">Loading invoices...</div> : (
        <div className="data-card">
          {invoices.length === 0 ? <div className="page-state">No invoices found.</div> : (
            <div className="table-scroll"><table className="data-table">
              <thead><tr><th>Tenant</th><th>Apartment</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>{invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td>{invoice.tenancy?.tenant?.name || "—"}</td>
                  <td>{invoice.tenancy?.apartment?.apartmentNumber || "—"}</td>
                  <td>₦{Number(invoice.amount || 0).toLocaleString()}</td>
                  <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td><span className={`status-badge ${invoice.status.toLowerCase()}`}>{invoice.status.replace(/_/g, " ")}</span></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>
      )}

      {showForm && <Modal title="Create Invoice" onClose={() => setShowForm(false)}>
        <form className="form-grid" onSubmit={submit}>
          <label className="full">Tenancy<select required value={form.tenancy} onChange={(e) => setForm({...form, tenancy:e.target.value})}><option value="">Select active tenancy</option>{tenancies.map((t) => <option key={t._id} value={t._id}>{t.tenant?.name} — Apartment {t.apartment?.apartmentNumber}</option>)}</select></label>
          <label>Amount<input type="number" min="0" required value={form.amount} onChange={(e) => setForm({...form, amount:e.target.value})} /></label>
          <label>Due Date<input type="date" required value={form.dueDate} onChange={(e) => setForm({...form, dueDate:e.target.value})} /></label>
          <div className="form-actions full"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Creating..." : "Create Invoice"}</button></div>
        </form>
      </Modal>}
    </div>
  );
};

export default Invoices;
