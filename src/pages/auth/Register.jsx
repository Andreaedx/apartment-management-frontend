import { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../../services/authService";
import AuthLayout from "../../components/layout/AuthLayout";

const Register = () => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "tenant",
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

    // Frontend validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        accountType: formData.accountType,
      });

      setMessage(
        response.data?.message ||
          "Registration successful. Please check your email to verify your account."
      );

      // Clear the form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        accountType: "tenant",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Unable to register. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join as a tenant or as a property manager."
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
        <fieldset className="auth-account-type">
          <legend>I am registering as</legend>

          <div className="auth-account-options">
            <label
              className={`auth-account-option ${
                formData.accountType === "tenant" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="accountType"
                value="tenant"
                checked={formData.accountType === "tenant"}
                onChange={handleChange}
              />

              <span className="auth-account-option-title">A tenant</span>
              <span className="auth-account-option-text">
                Rent an apartment, pay rent, raise requests
              </span>
            </label>

            <label
              className={`auth-account-option ${
                formData.accountType === "manager" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="accountType"
                value="manager"
                checked={formData.accountType === "manager"}
                onChange={handleChange}
              />

              <span className="auth-account-option-title">
                A property manager
              </span>
              <span className="auth-account-option-text">
                List properties and manage tenants
              </span>
            </label>
          </div>

          {formData.accountType === "manager" && (
            <p className="auth-hint">
              Manager accounts need admin approval. You can log in
              after verifying your email, and you'll get manager
              access once an admin approves your request.
            </p>
          )}
        </fieldset>

        <div className="auth-field">
          <label htmlFor="name">Full name</label>

          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="email">Email</label>

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

        <div className="auth-field-grid">
          <div className="auth-field">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">
              Confirm password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button
          className="auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{" "}
        <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
