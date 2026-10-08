import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/authService";
import AuthLayout from "../../components/layout/AuthLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(email);

      setMessage(
        response.data?.message ||
          "If an account exists with this email, a password reset link has been sent."
      );

      setEmail("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      {error && (
        <p className="auth-alert auth-alert-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="auth-alert auth-alert-success" role="status">
          {message}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <button
          className="auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="auth-footer">
        Remember your password?{" "}
        <Link to="/login">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
