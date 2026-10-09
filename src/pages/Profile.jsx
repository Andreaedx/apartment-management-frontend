import { useEffect, useRef, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
} from "../services/userService";

const MAX_PICTURE_SIZE = 5 * 1024 * 1024;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name:"", email:"" });
  const [password, setPassword] = useState({ currentPassword:"", newPassword:"" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);

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
      const response = await updateProfile(profile);
      const saved = response.data?.user || profile;
      // Keep the top bar and other pages in sync with the new name/email
      updateUser({ name: saved.name, email: saved.email });
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

  const changePicture = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_PICTURE_SIZE) {
      setError("Profile picture must be 5MB or smaller.");
      return;
    }

    try {
      setUploading(true); setError(""); setMessage("");
      const data = new FormData();
      data.append("profilePicture", file);
      const response = await uploadProfilePicture(data);
      updateUser({ profilePicture: response.data?.profilePicture });
      setMessage("Profile picture updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload profile picture.");
    } finally { setUploading(false); }
  };

  let pictureButtonLabel = "Upload picture";
  if (uploading) pictureButtonLabel = "Uploading...";
  else if (user?.profilePicture?.url) pictureButtonLabel = "Change picture";

  return (
    <div className="content-page">
      <PageHeader title="Profile" description="Manage your account information and password." />
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="profile-grid">
        <div className="data-card">
          <h3>Personal Information</h3>

          <div className="profile-picture">
            <div className="profile-picture-preview">
              {user?.profilePicture?.url ? (
                <img src={user.profilePicture.url} alt="Your profile" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>

            <div className="profile-picture-actions">
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={changePicture}
              />
              <button
                type="button"
                className="secondary-button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
              >
                {pictureButtonLabel}
              </button>
              <small>JPG, PNG or WebP, up to 5MB.</small>
            </div>
          </div>

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
