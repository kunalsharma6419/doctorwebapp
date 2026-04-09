import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { authService } from "../services/authService.js";

export function ProfilePage() {
  const { doctor } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      if (!form.currentPassword || !form.newPassword) {
        throw new Error("Current password and new password are required.");
      }

      if (form.newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters.");
      }

      await authService.changePassword(form);
      setForm({ currentPassword: "", newPassword: "" });
      setMessage("Password changed successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="details-layout">
      <article className="panel">
        <p className="eyebrow">Doctor Profile</p>
        <h1>{doctor?.name}</h1>
        <div className="chip-row">
          <span className="chip">{doctor?.email}</span>
          <span className="chip">{doctor?.specialization || "General practice"}</span>
        </div>
        <p className="soft-note section-gap">
          Keep your password private. If you suspect someone else knows it, change it here and log
          out from shared computers.
        </p>
      </article>

      <form className="panel form-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Security</p>
        <h2>Change Password</h2>
        <label>
          Current Password <span className="required-mark">*</span>
          <input
            type="password"
            placeholder="Enter your current password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
          />
        </label>
        <label>
          New Password <span className="required-mark">*</span>
          <input
            type="password"
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
          />
          <span className="helper-text">Use at least 8 characters. A longer phrase is safer.</span>
        </label>
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Updating..." : "Change Password"}
        </button>
        {message ? (
          <p className={message.includes("successfully") ? "success-text" : "error-text"}>{message}</p>
        ) : null}
      </form>
    </section>
  );
}
