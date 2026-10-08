import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Modal from "../components/common/Modal";
import {
  getUsers,
  updateUser,
  deleteUser,
} from "../services/userService";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", role:"tenant" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data?.users || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editing._id, form);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      await load();
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
                  <button className="secondary-button" onClick={() => { setEditing(u); setForm({name:u.name,email:u.email,role:u.role === "admin" ? "tenant" : u.role}); setShowForm(true); }}>Edit</button>
                  <button className="danger-button" onClick={() => remove(u._id)}>Delete</button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      )}

      {showForm && <Modal title="Edit User" onClose={() => setShowForm(false)}>
        <form className="form-grid" onSubmit={save}>
          <label>Name<input required value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} /></label>
          <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} /></label>
          <label>Role<select value={form.role} onChange={(e) => setForm({...form,role:e.target.value})}><option value="tenant">Tenant</option><option value="manager">Manager</option></select></label>
          <div className="form-actions full"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button">Save Changes</button></div>
        </form>
      </Modal>}
    </div>
  );
};

export default Users;
