import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { consultationService } from "../services/consultationService.js";
import { prescriptionService } from "../services/prescriptionService.js";

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

export function ConsultationDetailsPage() {
  const { consultationId } = useParams();
  const [consultation, setConsultation] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadConsultation() {
    setIsLoading(true);
    setMessage("");

    try {
      const [consultationResult, prescriptionResult] = await Promise.all([
        consultationService.getById(consultationId),
        prescriptionService.getByConsultationId(consultationId),
      ]);
      setConsultation(consultationResult.consultation);
      setPrescription(prescriptionResult.prescription);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadConsultation();
  }, [consultationId]);

  async function handleComplete() {
    setIsCompleting(true);
    setMessage("");

    try {
      await consultationService.complete(consultationId);
      await loadConsultation();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsCompleting(false);
    }
  }

  if (isLoading) {
    return <div className="panel">Loading consultation...</div>;
  }

  if (message && !consultation) {
    return <div className="panel error-text">{message}</div>;
  }

  if (!consultation) {
    return <div className="panel">Consultation not found.</div>;
  }

  return (
    <section className="record-page">
      <header className="record-hero">
        <div>
          <p className="eyebrow">Consultation Record</p>
          <h1>{consultation.chiefComplaint}</h1>
          <p>{formatDate(consultation.visitDate)} | {consultation.status}</p>
        </div>
        <div className="chip-row">
          <span className="chip">Patient: {consultation.patient.fullName}</span>
          <span className="chip">Follow-up: {formatDate(consultation.followUpDate)}</span>
        </div>
        <div className="dashboard-actions">
          <Link className="button-link secondary" to={`/patients/${consultation.patientId}`}>
            Back To Patient
          </Link>
          <Link className="button-link secondary" to={`/consultations/${consultation.id}/edit`}>
            Edit Consultation
          </Link>
          {consultation.status !== "COMPLETED" ? (
            <button type="button" disabled={isCompleting} onClick={handleComplete}>
              {isCompleting ? "Completing..." : "Mark Completed"}
            </button>
          ) : null}
        </div>
      </header>

      {message ? <p className="error-text">{message}</p> : null}

      <div className="details-layout">
        <article className="panel record-card-clean">
          <p className="eyebrow">Clinical Notes</p>
          <div className="info-grid">
            <div>
              <span>Symptoms</span>
              <strong>{consultation.symptoms || "-"}</strong>
            </div>
            <div>
              <span>Examination</span>
              <strong>{consultation.examinationNotes || "-"}</strong>
            </div>
            <div>
              <span>Diagnosis</span>
              <strong>{consultation.diagnosis || "-"}</strong>
            </div>
            <div>
              <span>Treatment Plan</span>
              <strong>{consultation.treatmentPlan || "-"}</strong>
            </div>
            <div>
              <span>Doctor Notes</span>
              <strong>{consultation.doctorNotes || "-"}</strong>
            </div>
          </div>
        </article>

        <article className="panel record-card-clean">
          <p className="eyebrow">Vitals</p>
          <h2>Recorded measurements</h2>
          <div className="summary-grid">
            <span>Temperature: {consultation.vitals?.temperature ?? "-"}</span>
            <span>
              BP: {consultation.vitals?.bloodPressureSystolic ?? "-"}/
              {consultation.vitals?.bloodPressureDiastolic ?? "-"}
            </span>
            <span>Pulse: {consultation.vitals?.pulseRate ?? "-"}</span>
            <span>Respiratory Rate: {consultation.vitals?.respiratoryRate ?? "-"}</span>
            <span>Oxygen: {consultation.vitals?.oxygenSaturation ?? "-"}</span>
            <span>Height: {consultation.vitals?.height ?? "-"}</span>
            <span>Weight: {consultation.vitals?.weight ?? "-"}</span>
            <span>BMI: {consultation.vitals?.bmi ?? "-"}</span>
          </div>

          <p className="eyebrow section-gap">Prescription</p>
          <h2>Medicines</h2>
          {!prescription?.items?.length ? <p className="muted">No medicines recorded.</p> : null}
          {prescription?.items?.map((item) => (
            <div className="record-card" key={item.id}>
              <strong>{item.medicineName}</strong>
              <small>Dosage: {item.dosage || "-"}</small>
              <small>Frequency: {item.frequency || "-"}</small>
              <small>Duration: {item.duration || "-"}</small>
              <small>Instructions: {item.instructions || "-"}</small>
              <small>Quantity: {item.quantity ?? "-"}</small>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}
