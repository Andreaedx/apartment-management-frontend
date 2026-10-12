import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  verifyEmail,
  resendVerification,
} from "../../services/authService";
import AuthLayout from "../../components/layout/AuthLayout";
import "./Auth.css";

const RESEND_COOLDOWN_SECONDS = 60;

// Enter the 6-digit code emailed at registration. The email is prefilled
// when coming from sign-up or login (?email=...).
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  // Message passed from sign-up (e.g. "awaiting admin approval" for managers)
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Count down before another code can be requested
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);

    try {
      await verifyEmail(email.trim(), code);
      setVerified(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to verify your email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setNotice("");

    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setResending(true);

    try {
      const response = await resendVerification(email.trim());
      setNotice(
        response.data?.message ||
          "If this email belongs to an unverified account, a new code has been sent."
      );
      setCode("");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to send a new code. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <AuthLayout title="Email verified">
        <div className="auth-status">
          <div
            className="auth-status-icon auth-status-success"
            aria-hidden="true"
          >
            ✓
          </div>

          <p className="auth-status-text" role="status">
            Your email has been verified. You can now log in.
          </p>
        </div>

        <Link className="auth-submit auth-button-link" to="/login">
          Go to login
        </Link>
      </AuthLayout>
    );
  }

  let resendLabel = "Resend code";
  if (resending) resendLabel = "Sending...";
  else if (cooldown > 0) resendLabel = `Resend code in ${cooldown}s`;

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your email. It expires after 15 minutes."
    >
      {error && (
        <p className="auth-alert auth-alert-error" role="alert">
          {error}
        </p>
      )}

      {notice && (
        <p className="auth-alert auth-alert-success" role="status">
          {notice}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="email">Email</label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="code">Verification code</label>

          <input
            id="code"
            name="code"
            className="auth-code-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            required
          />
        </div>

        <button
          className="auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify email"}
        </button>
      </form>

      <p className="auth-footer">
        Didn't get a code?{" "}
        <button
          type="button"
          className="auth-link-button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
        >
          {resendLabel}
        </button>
      </p>

      <p className="auth-footer">
        Already verified? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default VerifyEmail;
