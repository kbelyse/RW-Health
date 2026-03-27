import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/app/RequireAuth";
import { DashboardLayout } from "./components/app/DashboardLayout";
import { RoleGuard } from "./components/app/RoleGuard";
import { Home } from "./pages/Home";
import { Mission } from "./pages/Mission";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { NotFound } from "./pages/NotFound";
import { DashboardOverviewPage } from "./pages/dashboard/DashboardOverviewPage";
import { DashboardRecordsPage } from "./pages/dashboard/DashboardRecordsPage";
import { DashboardLabsPage } from "./pages/dashboard/DashboardLabsPage";
import { DashboardAppointmentsPage } from "./pages/dashboard/DashboardAppointmentsPage";
import { DashboardCareTeamPage } from "./pages/dashboard/DashboardCareTeamPage";
import { DashboardSettingsPage } from "./pages/dashboard/DashboardSettingsPage";
import { ClinicianDashboard } from "./pages/dashboards/ClinicianDashboard";
import { LabDashboard } from "./pages/dashboards/LabDashboard";
import { AdminDashboard } from "./pages/dashboards/AdminDashboard";

export default function App() {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverviewPage />} />
          <Route
            path="records"
            element={
              <RoleGuard allow={["PATIENT"]}>
                <DashboardRecordsPage />
              </RoleGuard>
            }
          />
          <Route
            path="labs"
            element={
              <RoleGuard allow={["PATIENT"]}>
                <DashboardLabsPage />
              </RoleGuard>
            }
          />
          <Route
            path="appointments"
            element={
              <RoleGuard allow={["PATIENT", "CLINICIAN", "ADMIN"]}>
                <DashboardAppointmentsPage />
              </RoleGuard>
            }
          />
          <Route
            path="care-team"
            element={
              <RoleGuard allow={["PATIENT"]}>
                <DashboardCareTeamPage />
              </RoleGuard>
            }
          />
          <Route path="settings" element={<DashboardSettingsPage />} />
          <Route
            path="patients"
            element={
              <RoleGuard allow={["CLINICIAN"]}>
                <ClinicianDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="upload"
            element={
              <RoleGuard allow={["LAB"]}>
                <LabDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="admin"
            element={
              <RoleGuard allow={["ADMIN"]}>
                <AdminDashboard />
              </RoleGuard>
            }
          />
        </Route>
      </Route>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="mission" element={<Mission />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
