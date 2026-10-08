import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../services/userService";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name:"", email:"" });
  const [password, setPassword] = useState({ currentPassword:"", newPassword:"" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getProfile();
        setProfile({
          name: response.data?.user?.name || user?.name || "",
          email: response.data?.user?.email || user?.email || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile.");
      }
    };
    load();
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); setError(""); setMessage("");
      await updateProfile(profile);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally { setSaving(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); setError(""); setMessage("");
      await changePassword(password);
      setPassword({ currentPassword:"", newPassword:"" });
      setMessage("Password changed successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally { setSaving(false); }
  };

  return (
    <div className="content-page">
      <PageHeader title="Profile" description="Manage your account information and password." />
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="profile-grid">
        <div className="data-card">
          <h3>Personal Information</h3>
          <form className="form-grid" onSubmit={saveProfile}>
            <label>Name<input required value={profile.name} onChange={(e) => setProfile({...profile,name:e.target.value})} /></label>
            <label>Email<input type="email" required value={profile.email} onChange={(e) => setProfile({...profile,email:e.target.value})} /></label>
            <div className="form-info full">Role: <strong>{user?.role}</strong></div>
            <div className="form-actions full"><button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button></div>
          </form>
        </div>

        <div className="data-card">
          <h3>Change Password</h3>
          <form className="form-grid" onSubmit={savePassword}>
            <label className="full">Current Password<input type="password" required value={password.currentPassword} onChange={(e) => setPassword({...password,currentPassword:e.target.value})} /></label>
            <label className="full">New Password<input type="password" minLength="6" required value={password.newPassword} onChange={(e) => setPassword({...password,newPassword:e.target.value})} /></label>
            <div className="form-actions full"><button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Change Password"}</button></div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
