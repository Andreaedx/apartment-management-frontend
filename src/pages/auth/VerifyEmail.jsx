import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { verifyEmail } from "../../services/authService";
import AuthLayout from "../../components/layout/AuthLayout";

const VerifyEmail = () => {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError("Verification token is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await verifyEmail(token);

        setMessage(
          response.data?.message ||
            "Your email has been verified successfully."
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to verify your email. The link may have expired or is invalid."
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  if (loading) {
    return (
      <AuthLayout
        title="Verifying your email"
        subtitle="Please wait while we verify your email address."
      >
        <div className="auth-status" role="status">
          <div className="auth-status-spinner" aria-hidden="true" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={message ? "Email verified" : "Verification failed"}
    >
      <div className="auth-status">
        <div
          className={`auth-status-icon ${
            message ? "auth-status-success" : "auth-status-error"
          }`}
          aria-hidden="true"
        >
          {message ? "✓" : "!"}
        </div>

        <p
          className="auth-status-text"
          role={message ? "status" : "alert"}
        >
          {message || error}
        </p>
      </div>

      <Link className="auth-submit auth-button-link" to="/login">
        {message ? "Go to login" : "Back to login"}
      </Link>
    </AuthLayout>
  );
};

export default VerifyEmail;
