import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Modal from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import {
  getUsers,
  updateUser,
  deleteUser,
} from "../services/userService";

const PAGE_SIZE = 20;

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", role:"tenant" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Bumped after a save or delete to fetch the list again
  const [reloadKey, setReloadKey] = useState(0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await getUsers({ page, limit: PAGE_SIZE });
        if (cancelled) return;
        setUsers(response.data?.users || []);
        setPagination(response.data?.pagination || { total: 0, pages: 1 });
        setError("");
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Failed to load users.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [reloadKey, page]);

  const goToPage = (next) => {
    setLoading(true);
    setPage(next);
  };

  const reload = () => setReloadKey((key) => key + 1);

  const isAdmin = editing?.role === "admin";

  const save = async (e) => {
    e.preventDefault();
    try {
      // Admin roles can't be changed here, so never send a role for an admin
      const data = isAdmin ? { name: form.name, email: form.email } : form;
      await updateUser(editing._id, data);
      setShowForm(false);
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  return (
    <div className="content-page">
      <PageHeader title="Users" description="Manage tenant and manager accounts." />
      {error && <div className="alert error">{error}</div>}
      {loading ? <div className="page-state">Loading users...</div> : (
        <div className="data-card">
          <div className="table-scroll"><table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Actions</th></tr></thead>
            <tbody>{users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td><td>{u.email}</td>
                <td><span className="status-badge">{u.role}</span></td>
                <td>{u.isEmailVerified ? "Yes" : "No"}</td>
                <td className="actions">
                  <button className="secondary-button" onClick={() => { setEditing(u); setForm({name:u.name,email:u.email,role:u.role}); setShowForm(true); }}>Edit</button>
                  {u._id !== currentUserId && (
                    <button className="danger-button" onClick={() => remove(u._id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}</tbody>
          </table></div>
          <div className="pagination">
            <span>
              {pagination.total} user{pagination.total === 1 ? "" : "s"} · page {page} of {Math.max(pagination.pages, 1)}
            </span>
            <div className="pagination-buttons">
              <button type="button" className="secondary-button" onClick={() => goToPage(page - 1)} disabled={page <= 1}>Previous</button>
              <button type="button" className="secondary-button" onClick={() => goToPage(page + 1)} disabled={page >= pagination.pages}>Next</button>
            </div>
          </div>
        </div>
      )}

      {showForm && <Modal title="Edit User" onClose={() => setShowForm(false)}>
        <form className="form-grid" onSubmit={save}>
          <label>Name<input required value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} /></label>
          <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} /></label>
          {isAdmin ? (
            <div className="form-info full">Role: <strong>admin</strong> (admin roles can't be changed here)</div>
          ) : (
            <label>Role<select value={form.role} onChange={(e) => setForm({...form,role:e.target.value})}><option value="tenant">Tenant</option><option value="manager">Manager</option></select></label>
          )}
          <div className="form-actions full"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button">Save Changes</button></div>
        </form>
      </Modal>}
    </div>
  );
};

export default Users;
