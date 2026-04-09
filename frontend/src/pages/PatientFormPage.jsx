import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { locationService } from "../services/locationService.js";
import { patientService } from "../services/patientService.js";

const emptyForm = {
  fullName: "",
  dateOfBirth: "",
  age: "",
  gender: "MALE",
  phone: "",
  country: "",
  state: "",
  city: "",
  address: "",
  bloodGroup: "",
  allergies: "",
  chronicConditions: "",
  notes: "",
};

function toDateInput(value) {
  return value ? value.slice(0, 10) : "";
}

function toPayload(form) {
  return {
    fullName: form.fullName,
    dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
    age: form.age ? Number(form.age) : null,
    gender: form.gender,
    phone: form.phone || null,
    country: form.country || null,
    state: form.state || null,
    city: form.city || null,
    address: form.address || null,
    bloodGroup: form.bloodGroup || null,
    allergies: form.allergies || null,
    chronicConditions: form.chronicConditions || null,
    notes: form.notes || null,
  };
}

function validatePatientForm(form) {
  const errors = [];

  if (!form.fullName.trim()) {
    errors.push("Full name is required.");
  }

  if (!form.gender) {
    errors.push("Gender is required.");
  }

  if (form.age !== "" && (Number(form.age) < 0 || Number(form.age) > 130)) {
    errors.push("Age must be between 0 and 130.");
  }

  if (form.phone && form.phone.trim().length < 7) {
    errors.push("Mobile number must be at least 7 characters.");
  }

  return errors;
}

export function PatientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    async function loadCountries() {
      try {
        const result = await locationService.getCountries();
        setCountries(result);
      } catch (_error) {
        setLocationMessage("Location suggestions are unavailable. You can still type manually.");
      }
    }

    loadCountries();
  }, []);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    async function loadPatient() {
      try {
        const result = await patientService.getById(id);
        const patient = result.patient;
        setForm({
          fullName: patient.fullName || "",
          dateOfBirth: toDateInput(patient.dateOfBirth),
          age: patient.age ?? "",
          gender: patient.gender || "MALE",
          phone: patient.phone || "",
          country: patient.country || "",
          state: patient.state || "",
          city: patient.city || "",
          address: patient.address || "",
          bloodGroup: patient.bloodGroup || "",
          allergies: patient.allergies || "",
          chronicConditions: patient.chronicConditions || "",
          notes: patient.notes || "",
        });
      } catch (error) {
        setMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPatient();
  }, [id, isEdit]);

  useEffect(() => {
    async function loadSavedLocationSuggestions() {
      if (!form.country) {
        return;
      }

      try {
        const stateResult = await locationService.getStates(form.country);
        setStates(stateResult);

        if (form.state) {
          setCities(await locationService.getCities(form.country, form.state));
        }
      } catch (_error) {
        setLocationMessage("Location suggestions are unavailable. You can still type manually.");
      }
    }

    loadSavedLocationSuggestions();
  }, [form.country, form.state]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function updateCountry(value) {
    setForm((current) => ({ ...current, country: value, state: "", city: "" }));
    setStates([]);
    setCities([]);

    try {
      setStates(await locationService.getStates(value));
      setLocationMessage("");
    } catch (_error) {
      setLocationMessage("State suggestions are unavailable. You can still type manually.");
    }
  }

  async function updateState(value) {
    setForm((current) => ({ ...current, state: value, city: "" }));
    setCities([]);

    try {
      setCities(await locationService.getCities(form.country, value));
      setLocationMessage("");
    } catch (_error) {
      setLocationMessage("City suggestions are unavailable. You can still type manually.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const validationErrors = validatePatientForm(form);

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("\n"));
      }

      const payload = toPayload(form);
      const result = isEdit
        ? await patientService.update(id, payload)
        : await patientService.create(payload);

      navigate(`/patients/${result.patient.id}`, { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="panel">Loading patient...</div>;
  }

  return (
    <section>
      <header className="page-header panel hero-panel">
        <div>
          <p className="eyebrow">Patient Form</p>
          <h1>{isEdit ? "Update patient details" : "Add patient details"}</h1>
          <p className="muted">
            Fill the required identity fields first. Medical background helps during future visits.
          </p>
        </div>
      </header>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="full-span soft-note">
          Required fields are marked with red asterisks. Use either age, date of birth, or both if
          available. Phone numbers should contain at least 7 digits. Country, state, and city show
          suggestions as you type, but manual entries are allowed.
        </div>
        <label>
          Full Name <span className="required-mark">*</span>
          <input
            required
            value={form.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="Example: Rahul Sharma"
          />
          <span className="helper-text">Minimum 2 characters. Use the name shown in clinic records.</span>
        </label>
        <label>
          Date of Birth
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(event) => updateField("dateOfBirth", event.target.value)}
          />
          <span className="helper-text">Optional, but useful for accurate age tracking.</span>
        </label>
        <label>
          Age
          <input
            type="number"
            min="0"
            max="130"
            value={form.age}
            onChange={(event) => updateField("age", event.target.value)}
            placeholder="Years"
          />
          <span className="helper-text">Allowed range: 0 to 130 years.</span>
        </label>
        <label>
          Gender <span className="required-mark">*</span>
          <select value={form.gender} onChange={(event) => updateField("gender", event.target.value)}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <span className="helper-text">Required for patient profile and visit history.</span>
        </label>
        <label>
          Mobile Number
          <input
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="Example: 9876543210"
          />
          <span className="helper-text">Use at least 7 digits. Avoid spaces if possible.</span>
        </label>
        <label>
          Country
          <input
            list="country-options"
            value={form.country}
            onChange={(event) => updateCountry(event.target.value)}
            placeholder="Example: India"
          />
          <datalist id="country-options">
            {countries
              .filter((country) => country.toLowerCase().includes(form.country.toLowerCase()))
              .slice(0, 20)
              .map((country) => (
                <option key={country} value={country} />
              ))}
          </datalist>
          <span className="helper-text">Start typing and choose a suggested country when available.</span>
        </label>
        <label>
          State
          <input
            list="state-options"
            value={form.state}
            onChange={(event) => updateState(event.target.value)}
            placeholder="Example: Maharashtra"
          />
          <datalist id="state-options">
            {states
              .filter((state) => state.toLowerCase().includes(form.state.toLowerCase()))
              .slice(0, 20)
              .map((state) => (
                <option key={state} value={state} />
              ))}
          </datalist>
          <span className="helper-text">Select country first for better state suggestions.</span>
        </label>
        <label>
          City
          <input
            list="city-options"
            value={form.city}
            onChange={(event) => updateField("city", event.target.value)}
            placeholder="Example: Mumbai"
          />
          <datalist id="city-options">
            {cities
              .filter((city) => city.toLowerCase().includes(form.city.toLowerCase()))
              .slice(0, 20)
              .map((city) => (
                <option key={city} value={city} />
              ))}
          </datalist>
          <span className="helper-text">Select state first for city suggestions. Manual typing is allowed.</span>
        </label>
        <label>
          Blood Group
          <input
            value={form.bloodGroup}
            onChange={(event) => updateField("bloodGroup", event.target.value)}
            placeholder="Example: B+"
          />
          <span className="helper-text">Optional. Example values: A+, B-, O+, AB+.</span>
        </label>
        <label className="full-span">
          Full Address
          <textarea
            rows="3"
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            placeholder="House number, street, landmark, postal code"
          />
          <span className="helper-text">Optional. Keep street, landmark, and postal code here.</span>
        </label>
        {locationMessage ? <p className="full-span muted">{locationMessage}</p> : null}
        <label className="full-span">
          Allergies
          <textarea
            rows="3"
            value={form.allergies}
            onChange={(event) => updateField("allergies", event.target.value)}
            placeholder="Example: Penicillin allergy, dust allergy, no known allergies"
          />
          <span className="helper-text">Mention drug allergies clearly to reduce prescription risk.</span>
        </label>
        <label className="full-span">
          Chronic Conditions
          <textarea
            rows="3"
            value={form.chronicConditions}
            onChange={(event) => updateField("chronicConditions", event.target.value)}
            placeholder="Example: Diabetes, hypertension, asthma"
          />
          <span className="helper-text">Add long-term conditions that matter during consultation.</span>
        </label>
        <label className="full-span">
          Notes
          <textarea
            rows="3"
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Any other clinic notes"
          />
          <span className="helper-text">Optional internal notes for the doctor.</span>
        </label>
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Patient"}
        </button>
        {message ? <p className="error-text">{message}</p> : null}
      </form>
    </section>
  );
}
