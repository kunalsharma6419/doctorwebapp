import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/common/AppShell.jsx";
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { PatientsPage } from "./pages/PatientsPage.jsx";
import { PatientFormPage } from "./pages/PatientFormPage.jsx";
import { PatientDetailsPage } from "./pages/PatientDetailsPage.jsx";
import { ConsultationPage } from "./pages/ConsultationPage.jsx";
import { ConsultationDetailsPage } from "./pages/ConsultationDetailsPage.jsx";
import { ConsultationsPage } from "./pages/ConsultationsPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/new" element={<PatientFormPage />} />
          <Route path="/patients/:id" element={<PatientDetailsPage />} />
          <Route path="/patients/:id/edit" element={<PatientFormPage />} />
          <Route path="/patients/:id/consultations/new" element={<ConsultationPage />} />
          <Route path="/consultations" element={<ConsultationsPage />} />
          <Route path="/consultations/new" element={<ConsultationPage />} />
          <Route path="/consultations/:consultationId" element={<ConsultationDetailsPage />} />
          <Route path="/consultations/:consultationId/edit" element={<ConsultationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
