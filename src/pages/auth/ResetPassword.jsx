import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import AuthLayout from "../../components/layout/AuthLayout";

const ResetPassword = () => {
  const { token } = useParams();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("Password reset token is missing.");
      return;
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(
        token,
        formData.newPassword
      );

      setMessage(
        response.data?.message ||
          "Password reset successfully."
      );

      setFormData({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to reset your password. The link may have expired or is invalid."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={message ? "Password updated" : "Set a new password"}
      subtitle={
        message
          ? "You can now log in with your new password."
          : "Choose a new password for your account."
      }
    >
      {error && (
        <p className="auth-alert auth-alert-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <>
          <p className="auth-alert auth-alert-success" role="status">
            {message}
          </p>

          <Link className="auth-submit auth-button-link" to="/login">
            Go to login
          </Link>
        </>
      )}

      {!message && (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="newPassword">
              New password
            </label>

            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">
              Confirm new password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      )}

      {!message && (
        <p className="auth-footer">
          Remember your password?{" "}
          <Link to="/login">
            Log in
          </Link>
        </p>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
