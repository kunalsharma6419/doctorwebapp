import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { consultationService } from "../services/consultationService.js";
import { patientService } from "../services/patientService.js";

const emptyVisit = {
  patientId: "",
  chiefComplaint: "",
  symptoms: "",
  examinationNotes: "",
  diagnosis: "",
  treatmentPlan: "",
  doctorNotes: "",
  followUpDate: "",
};

const emptyVitals = {
  temperature: "",
  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  pulseRate: "",
  respiratoryRate: "",
  oxygenSaturation: "",
  height: "",
  weight: "",
  bmi: "",
};

const emptyMedicine = {
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
  quantity: "",
};

function toDateInput(value) {
  return value ? value.slice(0, 10) : "";
}

function toIsoDate(value) {
  return value ? new Date(value).toISOString() : null;
}

function toNumberOrNull(value) {
  return value === "" || value === null || value === undefined ? null : Number(value);
}

function buildPayload(visit, vitals, medicines) {
  return {
    patientId: visit.patientId,
    chiefComplaint: visit.chiefComplaint,
    symptoms: visit.symptoms || null,
    examinationNotes: visit.examinationNotes || null,
    diagnosis: visit.diagnosis || null,
    treatmentPlan: visit.treatmentPlan || null,
    doctorNotes: visit.doctorNotes || null,
    followUpDate: toIsoDate(visit.followUpDate),
    status: "DRAFT",
    vitals: {
      temperature: toNumberOrNull(vitals.temperature),
      bloodPressureSystolic: toNumberOrNull(vitals.bloodPressureSystolic),
      bloodPressureDiastolic: toNumberOrNull(vitals.bloodPressureDiastolic),
      pulseRate: toNumberOrNull(vitals.pulseRate),
      respiratoryRate: toNumberOrNull(vitals.respiratoryRate),
      oxygenSaturation: toNumberOrNull(vitals.oxygenSaturation),
      height: toNumberOrNull(vitals.height),
      weight: toNumberOrNull(vitals.weight),
      bmi: toNumberOrNull(vitals.bmi),
    },
    prescription: {
      notes: null,
      items: medicines
        .filter((medicine) => medicine.medicineName.trim())
        .map((medicine) => ({
          medicineName: medicine.medicineName,
          dosage: medicine.dosage || null,
          frequency: medicine.frequency || null,
          duration: medicine.duration || null,
          instructions: medicine.instructions || null,
          quantity: toNumberOrNull(medicine.quantity),
        })),
    },
  };
}

function validateConsultationForm(visit, vitals, medicines) {
  const errors = [];

  if (!visit.patientId) {
    errors.push("Please select a patient.");
  }

  if (!visit.chiefComplaint.trim()) {
    errors.push("Chief complaint is required.");
  }

  const numericChecks = [
    ["Temperature", vitals.temperature, 30, 45],
    ["BP systolic", vitals.bloodPressureSystolic, 40, 300],
    ["BP diastolic", vitals.bloodPressureDiastolic, 30, 200],
    ["Pulse", vitals.pulseRate, 20, 250],
    ["Respiratory rate", vitals.respiratoryRate, 5, 80],
    ["Oxygen saturation", vitals.oxygenSaturation, 10, 100],
    ["Height", vitals.height, 30, 300],
    ["Weight", vitals.weight, 1, 500],
    ["BMI", vitals.bmi, 1, 100],
  ];

  numericChecks.forEach(([label, value, min, max]) => {
    if (value !== "" && (Number(value) < min || Number(value) > max)) {
      errors.push(`${label} must be between ${min} and ${max}.`);
    }
  });

  medicines.forEach((medicine, index) => {
    const hasAnyValue = Object.values(medicine).some((value) => String(value).trim());

    if (hasAnyValue && !medicine.medicineName.trim()) {
      errors.push(`Medicine ${index + 1}: medicine name is required.`);
    }

    if (medicine.quantity !== "" && Number(medicine.quantity) < 1) {
      errors.push(`Medicine ${index + 1}: quantity must be at least 1.`);
    }
  });

  return errors;
}

export function ConsultationPage() {
  const { id: routePatientId, consultationId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(consultationId);
  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [visit, setVisit] = useState({ ...emptyVisit, patientId: routePatientId || "" });
  const [vitals, setVitals] = useState(emptyVitals);
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      setMessage("");

      try {
        const patientsResult = await patientService.list();
        setPatients(patientsResult.patients);

        if (isEdit) {
          const consultationResult = await consultationService.getById(consultationId);
          const consultation = consultationResult.consultation;
          const selectedPatient = consultation.patient;

          setPatient(selectedPatient);
          setVisit({
            patientId: selectedPatient.id,
            chiefComplaint: consultation.chiefComplaint || "",
            symptoms: consultation.symptoms || "",
            examinationNotes: consultation.examinationNotes || "",
            diagnosis: consultation.diagnosis || "",
            treatmentPlan: consultation.treatmentPlan || "",
            doctorNotes: consultation.doctorNotes || "",
            followUpDate: toDateInput(consultation.followUpDate),
          });
          setVitals({
            temperature: consultation.vitals?.temperature ?? "",
            bloodPressureSystolic: consultation.vitals?.bloodPressureSystolic ?? "",
            bloodPressureDiastolic: consultation.vitals?.bloodPressureDiastolic ?? "",
            pulseRate: consultation.vitals?.pulseRate ?? "",
            respiratoryRate: consultation.vitals?.respiratoryRate ?? "",
            oxygenSaturation: consultation.vitals?.oxygenSaturation ?? "",
            height: consultation.vitals?.height ?? "",
            weight: consultation.vitals?.weight ?? "",
            bmi: consultation.vitals?.bmi ?? "",
          });
          setMedicines(
            consultation.prescription?.items?.length
              ? consultation.prescription.items.map((item) => ({
                  medicineName: item.medicineName || "",
                  dosage: item.dosage || "",
                  frequency: item.frequency || "",
                  duration: item.duration || "",
                  instructions: item.instructions || "",
                  quantity: item.quantity ?? "",
                }))
              : [{ ...emptyMedicine }],
          );

          const historyResult = await patientService.history(selectedPatient.id);
          setHistory(historyResult.history);
        } else if (routePatientId) {
          const [patientResult, historyResult] = await Promise.all([
            patientService.getById(routePatientId),
            patientService.history(routePatientId),
          ]);
          setPatient(patientResult.patient);
          setHistory(historyResult.history);
        }
      } catch (error) {
        setMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [consultationId, isEdit, routePatientId]);

  async function handlePatientChange(patientId) {
    setVisit((current) => ({ ...current, patientId }));
    setPatient(null);
    setHistory([]);

    if (!patientId) {
      return;
    }

    try {
      const [patientResult, historyResult] = await Promise.all([
        patientService.getById(patientId),
        patientService.history(patientId),
      ]);
      setPatient(patientResult.patient);
      setHistory(historyResult.history);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function updateVisit(field, value) {
    setVisit((current) => ({ ...current, [field]: value }));
  }

  function updateVitals(field, value) {
    setVitals((current) => ({ ...current, [field]: value }));
  }

  function updateMedicine(index, field, value) {
    setMedicines((current) =>
      current.map((medicine, medicineIndex) =>
        medicineIndex === index ? { ...medicine, [field]: value } : medicine,
      ),
    );
  }

  function addMedicine() {
    setMedicines((current) => [...current, { ...emptyMedicine }]);
  }

  function removeMedicine(index) {
    setMedicines((current) => current.filter((_medicine, medicineIndex) => medicineIndex !== index));
  }

  async function saveConsultation(shouldComplete) {
    setIsSaving(true);
    setMessage("");

    try {
      const validationErrors = validateConsultationForm(visit, vitals, medicines);

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("\n"));
      }

      const payload = buildPayload(visit, vitals, medicines);
      const result = isEdit
        ? await consultationService.update(consultationId, payload)
        : await consultationService.create(payload);

      const savedId = result.consultation.id;

      if (shouldComplete) {
        await consultationService.complete(savedId);
      }

      navigate(`/consultations/${savedId}`, { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="panel">Loading consultation...</div>;
  }

  return (
    <section className="consultation-layout">
      <div className="consultation-main">
        <article className="panel">
          <p className="eyebrow">{isEdit ? "Edit Visit" : "Visit Details"}</p>
          <h1>{isEdit ? "Edit Consultation" : "New Consultation"}</h1>
          <p className="muted">
            Every visit creates its own consultation record. Save as draft while examining, then
            complete when the prescription is final.
          </p>
          {message ? <p className="error-text">{message}</p> : null}

          <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
            <label className="full-span">
              Patient <span className="required-mark">*</span>
              <select
                disabled={Boolean(routePatientId) || isEdit}
                value={visit.patientId}
                onChange={(event) => handlePatientChange(event.target.value)}
              >
                <option value="">Select patient</option>
                {patients.map((patientOption) => (
                  <option key={patientOption.id} value={patientOption.id}>
                    {patientOption.fullName} ({patientOption.patientCode})
                  </option>
                ))}
              </select>
              <span className="helper-text">
                Select an existing patient. If this is a new patient, add them from the Patients page first.
              </span>
            </label>
            <label className="full-span">
              Chief Complaint <span className="required-mark">*</span>
              <input
                required
                value={visit.chiefComplaint}
                onChange={(event) => updateVisit("chiefComplaint", event.target.value)}
                placeholder="Example: Fever and cough for 3 days"
              />
              <span className="helper-text">Required. Keep it short and clinically searchable.</span>
            </label>
            <label className="full-span">
              Symptoms
              <textarea
                rows="3"
                value={visit.symptoms}
                onChange={(event) => updateVisit("symptoms", event.target.value)}
                placeholder="Example: Fever, dry cough, sore throat, fatigue"
              />
              <span className="helper-text">Optional. Add duration, severity, and associated symptoms.</span>
            </label>
            <label className="full-span">
              Examination Notes
              <textarea
                rows="4"
                value={visit.examinationNotes}
                onChange={(event) => updateVisit("examinationNotes", event.target.value)}
                placeholder="Example: Throat congestion present, chest clear, no wheeze"
              />
              <span className="helper-text">Optional. Record important positive and negative findings.</span>
            </label>
            <label className="full-span">
              Diagnosis
              <textarea
                rows="3"
                value={visit.diagnosis}
                onChange={(event) => updateVisit("diagnosis", event.target.value)}
                placeholder="Example: Viral upper respiratory infection"
              />
              <span className="helper-text">Optional for draft, recommended before completing consultation.</span>
            </label>
            <label className="full-span">
              Treatment Plan
              <textarea
                rows="3"
                value={visit.treatmentPlan}
                onChange={(event) => updateVisit("treatmentPlan", event.target.value)}
                placeholder="Example: Steam inhalation, hydration, rest, review if fever persists"
              />
              <span className="helper-text">Add non-medicine advice, precautions, and review instructions.</span>
            </label>
            <label>
              Follow-up Date
              <input
                type="date"
                value={visit.followUpDate}
                onChange={(event) => updateVisit("followUpDate", event.target.value)}
              />
              <span className="helper-text">Optional. Use when the patient should return for review.</span>
            </label>
            <label className="full-span">
              Doctor Notes
              <textarea
                rows="3"
                value={visit.doctorNotes}
                onChange={(event) => updateVisit("doctorNotes", event.target.value)}
                placeholder="Private notes"
              />
              <span className="helper-text">Internal notes only. Useful for clinical context on next visit.</span>
            </label>
          </form>
        </article>

        <article className="panel">
          <p className="eyebrow">Vitals</p>
          <p className="muted">
            Enter numbers only. Leave blank if a vital was not checked during this visit.
          </p>
          <div className="form-grid">
            {Object.entries({
              temperature: ["Temperature", "Allowed: 30 to 45. Use Celsius."],
              bloodPressureSystolic: ["BP Systolic", "Allowed: 40 to 300."],
              bloodPressureDiastolic: ["BP Diastolic", "Allowed: 30 to 200."],
              pulseRate: ["Pulse", "Allowed: 20 to 250 beats/min."],
              respiratoryRate: ["Respiratory Rate", "Allowed: 5 to 80 breaths/min."],
              oxygenSaturation: ["Oxygen Saturation", "Allowed: 10 to 100 percent."],
              height: ["Height", "Allowed: 30 to 300 cm."],
              weight: ["Weight", "Allowed: 1 to 500 kg."],
              bmi: ["BMI", "Allowed: 1 to 100."],
            }).map(([field, label]) => (
              <label key={field}>
                {label[0]}
                <input
                  type="number"
                  placeholder="Number only"
                  value={vitals[field]}
                  onChange={(event) => updateVitals(field, event.target.value)}
                />
                <span className="helper-text">{label[1]}</span>
              </label>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Prescription Builder</p>
              <h2>Medicines</h2>
              <p className="muted">Medicine name is required only when a row has prescription data.</p>
            </div>
            <button type="button" onClick={addMedicine}>
              Add Medicine
            </button>
          </div>

          {medicines.map((medicine, index) => (
            <div className="medicine-grid" key={index}>
              <input
                placeholder="Medicine name, e.g. Azithromycin"
                value={medicine.medicineName}
                onChange={(event) => updateMedicine(index, "medicineName", event.target.value)}
              />
              <input
                placeholder="Dosage, e.g. 500 mg"
                value={medicine.dosage}
                onChange={(event) => updateMedicine(index, "dosage", event.target.value)}
              />
              <input
                placeholder="Frequency, e.g. once daily"
                value={medicine.frequency}
                onChange={(event) => updateMedicine(index, "frequency", event.target.value)}
              />
              <input
                placeholder="Duration, e.g. 3 days"
                value={medicine.duration}
                onChange={(event) => updateMedicine(index, "duration", event.target.value)}
              />
              <input
                placeholder="Instructions, e.g. after food"
                value={medicine.instructions}
                onChange={(event) => updateMedicine(index, "instructions", event.target.value)}
              />
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={medicine.quantity}
                onChange={(event) => updateMedicine(index, "quantity", event.target.value)}
              />
              <button type="button" className="button-link secondary" onClick={() => removeMedicine(index)}>
                Remove
              </button>
            </div>
          ))}

          <div className="actions-row">
            <button type="button" disabled={isSaving} onClick={() => saveConsultation(false)}>
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            <button type="button" disabled={isSaving} onClick={() => saveConsultation(true)}>
              {isSaving ? "Saving..." : "Complete Consultation"}
            </button>
          </div>
        </article>
      </div>

      <aside className="consultation-side">
        <article className="panel">
          <p className="eyebrow">Patient Summary</p>
          {patient ? (
            <>
              <h2>{patient.fullName}</h2>
              <p className="muted">
                {patient.age ?? "-"} years, {patient.gender}
              </p>
              <p>Phone: {patient.phone || "-"}</p>
              <p>Allergies: {patient.allergies || "-"}</p>
              <p>Chronic conditions: {patient.chronicConditions || "-"}</p>
            </>
          ) : (
            <p className="muted">Select a patient to view summary.</p>
          )}
        </article>
        <article className="panel">
          <p className="eyebrow">Previous Visits</p>
          {history.length === 0 ? <p className="muted">No previous visits.</p> : null}
          {history.slice(0, 6).map((consultation) => (
            <Link className="timeline-item" key={consultation.id} to={`/consultations/${consultation.id}`}>
              <strong>{new Date(consultation.visitDate).toLocaleDateString("en-IN")}</strong>
              <small>{consultation.chiefComplaint}</small>
              <small>{consultation.diagnosis || "No diagnosis recorded"}</small>
              <span className="inline-action">Open Visit</span>
            </Link>
          ))}
        </article>
      </aside>
    </section>
  );
}
