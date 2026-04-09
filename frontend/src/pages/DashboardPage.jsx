import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { patientService } from "../services/patientService.js";

function isSameDate(value, compareDate) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  return date.toDateString() === compareDate.toDateString();
}

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

function lastSevenDays() {
  return Array.from({ length: 7 }, (_item, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
}

export function DashboardPage() {
  const [summary, setSummary] = useState({
    totalPatients: 0,
    todaysConsultations: 0,
    pendingFollowUps: 0,
    recentPatients: [],
    todayVisits: [],
    followUps: [],
    weeklyVisits: [],
    statusBreakdown: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        const patientsResult = await patientService.list();
        const patients = patientsResult.patients;
        const histories = await Promise.all(
          patients.slice(0, 50).map(async (patient) => {
            const historyResult = await patientService.history(patient.id);
            return historyResult.history.map((consultation) => ({
              ...consultation,
              patient,
            }));
          }),
        );

        const today = new Date();
        const allConsultations = histories.flat();
        const todayVisits = allConsultations
          .filter((consultation) => isSameDate(consultation.visitDate, today))
          .slice(0, 5);
        const followUps = allConsultations
          .filter(
            (consultation) =>
              consultation.followUpDate &&
              new Date(consultation.followUpDate) >= today &&
              consultation.status !== "COMPLETED",
          )
          .sort((first, second) => new Date(first.followUpDate) - new Date(second.followUpDate))
          .slice(0, 5);
        const weeklyVisits = lastSevenDays().map((date) => ({
          label: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
          count: allConsultations.filter((consultation) => isSameDate(consultation.visitDate, date)).length,
        }));
        const completedCount = allConsultations.filter(
          (consultation) => consultation.status === "COMPLETED",
        ).length;
        const draftCount = allConsultations.filter((consultation) => consultation.status === "DRAFT").length;

        setSummary({
          totalPatients: patients.length,
          todaysConsultations: todayVisits.length,
          pendingFollowUps: followUps.length,
          recentPatients: patients.slice(0, 5),
          todayVisits,
          followUps,
          weeklyVisits,
          statusBreakdown: [
            { label: "Completed", count: completedCount, className: "completed" },
            { label: "Draft", count: draftCount, className: "draft" },
          ],
        });
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const cards = [
    {
      label: "Patients",
      value: summary.totalPatients,
      hint: "Total registered",
      accent: "blue",
    },
    {
      label: "Today",
      value: summary.todaysConsultations,
      hint: "Consultations recorded",
      accent: "green",
    },
    {
      label: "Follow-ups",
      value: summary.pendingFollowUps,
      hint: "Upcoming incomplete",
      accent: "amber",
    },
  ];

  return (
    <section className="dashboard-page">
      <nav className="dashboard-navbar">
        <div>
          <strong>DoctorApp Analytics</strong>
          <small>{formatDate(new Date())}</small>
        </div>
        <div className="dashboard-nav-actions">
          <a href="#analytics">Analytics</a>
          <a href="#today">Today</a>
          <a href="#followups">Follow-ups</a>
          <a href="#recent">Recent Patients</a>
        </div>
      </nav>

      <header className="dashboard-hero">
        <div>
          <p className="eyebrow">Clinic Command Center</p>
          <h1>Good day, Doctor.</h1>
          <p>
            Manage patient records, start consultations, and keep follow-ups visible without
            digging through old registers.
          </p>
        </div>
        <div className="dashboard-actions">
          <Link className="button-link" to="/patients/new">
            Add Patient
          </Link>
          <Link className="button-link secondary" to="/patients">
            Search Patients
          </Link>
        </div>
      </header>

      {error ? <div className="panel error-text">{error}</div> : null}
      {isLoading ? <div className="panel">Loading dashboard...</div> : null}

      {!isLoading ? (
        <>
          <div className="dashboard-kpis">
            {cards.map((card) => (
              <article className={`dashboard-kpi dashboard-kpi-${card.accent}`} key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.hint}</small>
              </article>
            ))}
          </div>

          <section className="dashboard-grid" id="analytics">
            <article className="panel dashboard-card">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">Analytics</p>
                  <h2>Visits this week</h2>
                </div>
                <span className="chip">7 days</span>
              </div>
              <div className="bar-chart">
                {summary.weeklyVisits.map((day) => {
                  const maxCount = Math.max(...summary.weeklyVisits.map((item) => item.count), 1);
                  const height = Math.max((day.count / maxCount) * 100, day.count > 0 ? 12 : 4);

                  return (
                    <div className="bar-chart-item" key={day.label}>
                      <div className="bar-track">
                        <span style={{ height: `${height}%` }} />
                      </div>
                      <strong>{day.count}</strong>
                      <small>{day.label}</small>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="panel dashboard-card">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">Status</p>
                  <h2>Consultation completion</h2>
                </div>
              </div>
              <div className="donut-analytics">
                {summary.statusBreakdown.map((statusItem) => {
                  const total = Math.max(
                    summary.statusBreakdown.reduce((sum, item) => sum + item.count, 0),
                    1,
                  );
                  const percentage = Math.round((statusItem.count / total) * 100);

                  return (
                    <div
                      className={`status-analytics ${statusItem.className}`}
                      key={statusItem.label}
                      style={{ "--percentage": `${percentage}%` }}
                    >
                      <span>{percentage}%</span>
                      <strong>{statusItem.label}</strong>
                      <small>{statusItem.count} consultation(s)</small>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          <div className="dashboard-grid">
            <article className="panel dashboard-card" id="today">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">Today</p>
                  <h2>Consultations</h2>
                </div>
                <span className="chip">{summary.todayVisits.length} visit(s)</span>
              </div>
              {summary.todayVisits.length === 0 ? (
                <div className="empty-state">
                  <strong>No consultations recorded today.</strong>
                  <p>Start from a patient profile or create a new patient first.</p>
                  <Link className="button-link secondary" to="/patients">
                    Find Patient
                  </Link>
                </div>
              ) : null}
              {summary.todayVisits.map((consultation) => (
                <Link className="dashboard-row" key={consultation.id} to={`/consultations/${consultation.id}`}>
                  <span>
                    <strong>{consultation.patient.fullName}</strong>
                    <small>{consultation.chiefComplaint}</small>
                  </span>
                  <span className="status-pill">{consultation.status}</span>
                  <span className="inline-action">Open</span>
                </Link>
              ))}
            </article>

            <article className="panel dashboard-card" id="followups">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">Follow-up Queue</p>
                  <h2>Needs attention</h2>
                </div>
                <span className="chip">{summary.followUps.length} pending</span>
              </div>
              {summary.followUps.length === 0 ? (
                <div className="empty-state">
                  <strong>No pending follow-ups.</strong>
                  <p>Follow-up dates added during consultation will appear here.</p>
                </div>
              ) : null}
              {summary.followUps.map((consultation) => (
                <Link className="dashboard-row" key={consultation.id} to={`/consultations/${consultation.id}`}>
                  <span>
                    <strong>{consultation.patient.fullName}</strong>
                    <small>Due {formatDate(consultation.followUpDate)}</small>
                  </span>
                  <span className="status-pill">{consultation.status}</span>
                  <span className="inline-action">Review</span>
                </Link>
              ))}
            </article>
          </div>

          <article className="panel dashboard-card section-gap" id="recent">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Recent Patients</p>
                <h2>Recently updated records</h2>
              </div>
              <Link className="button-link secondary" to="/patients">
                View All Patients
              </Link>
            </div>
            {summary.recentPatients.length === 0 ? (
              <div className="empty-state">
                <strong>No patients yet.</strong>
                <p>Add the first patient to start using the consultation register.</p>
                <Link className="button-link" to="/patients/new">
                  Add First Patient
                </Link>
              </div>
            ) : null}
            <div className="recent-patient-grid">
              {summary.recentPatients.map((patient) => (
                <Link className="recent-patient-card" key={patient.id} to={`/patients/${patient.id}`}>
                  <span className="avatar-badge">{patient.fullName.slice(0, 1).toUpperCase()}</span>
                  <span>
                    <strong>{patient.fullName}</strong>
                    <small>{patient.patientCode}</small>
                    <small>{patient.phone || "No phone"}</small>
                  </span>
                  <span className="inline-action">Open Patient</span>
                </Link>
              ))}
            </div>
          </article>
        </>
      ) : null}
    </section>
  );
}
