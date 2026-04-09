import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../components/common/ConfirmDialog.jsx";
import { consultationService } from "../services/consultationService.js";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await consultationService.list({ search, status });
        setConsultations(result.consultations);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, status]);

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    try {
      await consultationService.remove(deleteTarget.id);
      setConsultations((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section>
      <header className="page-header panel hero-panel">
        <div>
          <p className="eyebrow">Consultations</p>
          <h1>All visit records</h1>
          <p className="muted">
            Review every consultation across patients. Search by patient, phone, complaint, or diagnosis.
          </p>
        </div>
        <Link className="button-link" to="/consultations/new">
          New Consultation
        </Link>
      </header>

      <div className="panel toolbar-panel">
        <label>
          Search Consultations
          <input
            className="search-input"
            placeholder="Example: fever, Rahul, PT-123456, or 9876543210"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span className="helper-text">Search checks patient details, complaint, and diagnosis.</span>
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <span className="helper-text">Use this to quickly find pending drafts.</span>
        </label>
        <span className="chip">{consultations.length} result(s)</span>
      </div>

      <div className="panel data-table-card">
        <div className="data-table-title">
          <div>
            <p className="eyebrow">Visit Register</p>
            <h2>Consultation records</h2>
          </div>
          <span className="chip">{consultations.length} record(s)</span>
        </div>

        {isLoading ? <p className="muted">Loading consultations...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!isLoading && consultations.length === 0 ? (
          <div className="empty-state">
            <strong>No consultations found.</strong>
            <p>Try a different search or start a new consultation from a patient profile.</p>
          </div>
        ) : null}

        {!isLoading && consultations.length > 0 ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Visit Date</th>
                  <th>Patient</th>
                  <th>Chief Complaint</th>
                  <th>Diagnosis</th>
                  <th>Status</th>
                  <th>Rx</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((consultation) => (
                  <tr key={consultation.id}>
                    <td>{formatDate(consultation.visitDate)}</td>
                    <td>
                      <div className="table-person">
                        <span className="avatar-badge">
                          {consultation.patient.fullName.slice(0, 1).toUpperCase()}
                        </span>
                        <span>
                          <strong>{consultation.patient.fullName}</strong>
                          <small>{consultation.patient.patientCode}</small>
                        </span>
                      </div>
                    </td>
                    <td>{consultation.chiefComplaint}</td>
                    <td>{consultation.diagnosis || "-"}</td>
                    <td>
                      <span className="status-pill">{consultation.status}</span>
                    </td>
                    <td>{consultation.prescription?._count?.items ?? 0} item(s)</td>
                    <td>
                      <div className="table-actions">
                        <Link className="table-action" to={`/consultations/${consultation.id}`}>
                          View
                        </Link>
                        <Link className="table-action secondary" to={`/consultations/${consultation.id}/edit`}>
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="table-action danger"
                          onClick={() => setDeleteTarget(consultation)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete consultation?"
        description={
          deleteTarget
            ? `This will permanently remove the visit for ${deleteTarget.patient.fullName} on ${formatDate(
                deleteTarget.visitDate,
              )}.`
            : ""
        }
        confirmLabel="Delete Visit"
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
