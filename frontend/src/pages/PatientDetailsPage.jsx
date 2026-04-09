import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { patientService } from "../services/patientService.js";

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

export function PatientDetailsPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatientDetails() {
      setIsLoading(true);
      setError("");

      try {
        const [patientResult, historyResult] = await Promise.all([
          patientService.getById(id),
          patientService.history(id),
        ]);

        setPatient(patientResult.patient);
        setHistory(historyResult.history);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPatientDetails();
  }, [id]);

  if (isLoading) {
    return <div className="panel">Loading patient details...</div>;
  }

  if (error) {
    return <div className="panel error-text">{error}</div>;
  }

  if (!patient) {
    return <div className="panel">Patient not found.</div>;
  }

  return (
    <section className="record-page">
      <header className="record-hero">
        <div className="avatar-badge large">{patient.fullName.slice(0, 1).toUpperCase()}</div>
        <div>
          <p className="eyebrow">Patient Profile</p>
          <h1>{patient.fullName}</h1>
          <p>{patient.gender}, {patient.age ?? "-"} years, {patient.phone || "No phone"}</p>
          <div className="chip-row">
            <span className="chip">Code: {patient.patientCode}</span>
            <span className="chip">Blood: {patient.bloodGroup || "-"}</span>
            <span className="chip">Visits: {history.length}</span>
          </div>
        </div>
        <div className="dashboard-actions">
          <Link className="button-link" to={`/patients/${patient.id}/consultations/new`}>
            New Consultation
          </Link>
          <Link className="button-link secondary" to={`/patients/${patient.id}/edit`}>
            Edit Patient
          </Link>
        </div>
      </header>

      <div className="details-layout">
        <article className="panel record-card-clean">
          <p className="eyebrow">Clinical Background</p>
          <div className="info-grid">
            <div>
              <span>Allergies</span>
              <strong>{patient.allergies || "-"}</strong>
            </div>
            <div>
              <span>Chronic Conditions</span>
              <strong>{patient.chronicConditions || "-"}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{[patient.city, patient.state, patient.country].filter(Boolean).join(", ") || "-"}</strong>
            </div>
            <div>
              <span>Full Address</span>
              <strong>{patient.address || "-"}</strong>
            </div>
          </div>
          <div className="soft-note section-gap">
            <strong>Doctor notes</strong>
            <p>{patient.notes || "No patient notes recorded."}</p>
          </div>
        </article>

        <article className="panel record-card-clean">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Consultation Timeline</p>
              <h2>Previous visits</h2>
            </div>
          </div>
          {history.length === 0 ? <p className="muted">No consultations yet.</p> : null}
          {history.map((consultation) => (
            <Link className="timeline-item" key={consultation.id} to={`/consultations/${consultation.id}`}>
              <strong>{formatDate(consultation.visitDate)}</strong>
              <span>{consultation.chiefComplaint}</span>
              <small>Diagnosis: {consultation.diagnosis || "-"}</small>
              <small>Status: {consultation.status}</small>
              {consultation.prescription?.items?.length ? (
                <small>Medicines: {consultation.prescription.items.length}</small>
              ) : null}
              <span className="inline-action">View Consultation</span>
            </Link>
          ))}
        </article>
      </div>
    </section>
  );
}
