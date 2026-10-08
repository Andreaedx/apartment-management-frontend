import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/layout/AuthLayout";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

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

    try {
      await login(
        formData.email,
        formData.password
      );

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to login. Please try again.";

      setError(message);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your account to continue."
    >
      {error && (
        <p className="auth-alert auth-alert-error" role="alert">
          {error}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-field">
          <div className="auth-field-row">
            <label htmlFor="password">
              Password
            </label>

            <Link className="auth-link-small" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          className="auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="auth-footer">
        Don't have an account?{" "}
        <Link to="/register">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
