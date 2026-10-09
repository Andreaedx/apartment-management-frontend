import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Modal from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import { getInvoices } from "../services/invoiceService";
import { getPayments, createPayment } from "../services/paymentService";

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({ invoice: "", amount: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Bumped after a payment to fetch the list again
  const [reloadKey, setReloadKey] = useState(0);

  // Only tenants can pay; managers can view payments for their properties
  const canPay = user?.role === "tenant";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [paymentResponse, invoiceResponse] = await Promise.all([
          getPayments(),
          getInvoices(),
        ]);
        if (cancelled) return;
        setPayments(paymentResponse.data?.data || []);
        setInvoices(invoiceResponse.data?.data || []);
        setError("");
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Failed to load payments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createPayment({ invoice: form.invoice, amount: Number(form.amount) });
      setShowForm(false);
      setForm({ invoice:"", amount:"" });
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create payment.");
    } finally {
      setSaving(false);
    }
  };

  const selectedInvoice = invoices.find((i) => i._id === form.invoice);

  return (
    <div className="content-page">
      <PageHeader
        title="Payments"
        description={canPay ? "View your payments and pay your invoices." : "View payments made against invoices."}
        action={canPay ? <button className="primary-button" onClick={() => setShowForm(true)}>Make Payment</button> : null}
      />
      {error && <div className="alert error">{error}</div>}
      {loading ? <div className="page-state">Loading payments...</div> : (
        <div className="data-card">
          {payments.length === 0 ? <div className="page-state">No payments found.</div> : (
            <div className="table-scroll"><table className="data-table">
              <thead><tr><th>Tenant</th><th>Apartment</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.invoice?.tenancy?.tenant?.name || "—"}</td>
                  <td>{payment.invoice?.tenancy?.apartment?.apartmentNumber || "—"}</td>
                  <td>₦{Number(payment.amount || 0).toLocaleString()}</td>
                  <td><span className={`status-badge ${String(payment.status || "").toLowerCase()}`}>{payment.status || "—"}</span></td>
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>
      )}

      {showForm && <Modal title="Make Payment" onClose={() => setShowForm(false)}>
        <form className="form-grid" onSubmit={submit}>
          <label className="full">Invoice<select required value={form.invoice} onChange={(e) => setForm({...form, invoice:e.target.value})}><option value="">Select invoice</option>{invoices.filter((i) => i.status !== "PAID").map((i) => <option key={i._id} value={i._id}>{i.tenancy?.tenant?.name || "Tenant"} — ₦{Number(i.amount).toLocaleString()}</option>)}</select></label>
          {selectedInvoice && <div className="form-info full">Invoice amount: ₦{Number(selectedInvoice.amount).toLocaleString()}</div>}
          <label className="full">Amount<input type="number" min="1" required value={form.amount} onChange={(e) => setForm({...form, amount:e.target.value})} /></label>
          <div className="form-actions full"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Processing..." : "Pay"}</button></div>
        </form>
      </Modal>}
    </div>
  );
};

export default Payments;
