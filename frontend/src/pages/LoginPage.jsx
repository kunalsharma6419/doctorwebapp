import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export function LoginPage() {
  const { doctor, isCheckingAuth, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/";

  if (isCheckingAuth) {
    return <div className="centered-page">Checking login...</div>;
  }

  if (doctor) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="centered-page">
      <div className="login-layout">
        <section className="panel hero-panel">
          <p className="eyebrow">Doctor-only MVP</p>
          <h1>Fast consultation records for a single clinic.</h1>
          <p className="muted">
            Search patients, start every visit as a new consultation, record diagnosis, and keep
            prescriptions linked to the exact visit.
          </p>
          <div className="chip-row">
            <span className="chip">Patient history</span>
            <span className="chip">Vitals</span>
            <span className="chip">Diagnosis</span>
            <span className="chip">Prescription</span>
          </div>
        </section>

        <form className="panel form-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Secure Access</p>
          <h1>Doctor Login</h1>
          <p className="muted">Use the seeded doctor account or your own doctor credentials.</p>
          <label>
            Email <span className="required-mark">*</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="doctor@example.com"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <span className="helper-text">Enter a valid email address for the doctor account.</span>
          </label>
          <label>
            Password <span className="required-mark">*</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            <span className="helper-text">Default seed password is available in the README.</span>
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          {message ? <p className="error-text">{message}</p> : null}
        </form>
      </div>
    </div>
  );
}
