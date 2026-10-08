import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";

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
    <div>
      <h1>Reset Password</h1>

      <p>Enter your new password below.</p>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {message && (
        <div>
          <p style={{ color: "green" }}>
            {message}
          </p>

          <Link to="/login">
            Go to Login
          </Link>
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword">
              New Password
            </label>

            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              minLength={6}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              minLength={6}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      {!message && (
        <p>
          Remember your password?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      )}
    </div>
  );
};

export default ResetPassword;