import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../components/common/ConfirmDialog.jsx";
import { patientService } from "../services/patientService.js";

export function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await patientService.list(search);
        setPatients(result.patients);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    try {
      await patientService.remove(deleteTarget.id);
      setPatients((current) => current.filter((item) => item.id !== deleteTarget.id));
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
          <p className="eyebrow">Patients</p>
          <h1>Search and manage patients</h1>
          <p className="muted">
            Search first by name, mobile number, or patient code to avoid duplicate patient records.
          </p>
        </div>
        <Link className="button-link" to="/patients/new">
          Add Patient
        </Link>
      </header>

      <div className="panel toolbar-panel">
        <label>
          Quick Search
          <input
            className="search-input"
            placeholder="Example: Rahul, 9876543210, or PT-123456"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span className="helper-text">The list refreshes shortly after you stop typing.</span>
        </label>
        <span className="chip">{patients.length} result(s)</span>
      </div>

      <div className="panel data-table-card">
        <div className="data-table-title">
          <div>
            <p className="eyebrow">Patient Directory</p>
            <h2>Registered patients</h2>
          </div>
          <span className="chip">{patients.length} record(s)</span>
        </div>

        {isLoading ? <p className="muted">Loading patients...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!isLoading && patients.length === 0 ? (
          <div className="empty-state">
            <strong>No patients found.</strong>
            <p>Try another search term or add a new patient record.</p>
          </div>
        ) : null}

        {!isLoading && patients.length > 0 ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Code</th>
                  <th>Gender / Age</th>
                  <th>Phone</th>
                  <th>Visits</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="table-person">
                        <span className="avatar-badge">{patient.fullName.slice(0, 1).toUpperCase()}</span>
                        <span>
                          <strong>{patient.fullName}</strong>
                          <small>{[patient.city, patient.state].filter(Boolean).join(", ") || "No location"}</small>
                        </span>
                      </div>
                    </td>
                    <td>{patient.patientCode}</td>
                    <td>
                      {patient.gender} / {patient.age ?? "-"}
                    </td>
                    <td>{patient.phone || "-"}</td>
                    <td>
                      <span className="status-pill">{patient._count?.consultations ?? 0}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link className="table-action" to={`/patients/${patient.id}`}>
                          View
                        </Link>
                        <Link className="table-action secondary" to={`/patients/${patient.id}/edit`}>
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="table-action danger"
                          onClick={() => setDeleteTarget(patient)}
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
        title={`Delete ${deleteTarget?.fullName || "patient"}?`}
        description="This will permanently remove the patient profile and all consultation history linked to this patient."
        confirmLabel="Delete Patient"
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
