import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { verifyEmail } from "../../services/authService";

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
      <div>
        <h1>Verifying Email...</h1>
        <p>Please wait while we verify your email address.</p>
      </div>
    );
  }

  return (
    <div>
      {message ? (
        <>
          <h1>Email Verified</h1>
          <p>{message}</p>

          <Link to="/login">
            Go to Login
          </Link>
        </>
      ) : (
        <>
          <h1>Verification Failed</h1>
          <p style={{ color: "red" }}>{error}</p>

          <Link to="/login">
            Back to Login
          </Link>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;