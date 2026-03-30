import { Routes, Route, Outlet } from "react-router-dom";
import { Layout } from "./components/Layout";
import { OfflineBar } from "./components/OfflineBar";
import { useOnline } from "./hooks/useOnline";
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
import { PatientDirectory, PatientChartPage } from "./pages/dashboards/ClinicianDashboard";
import { LabDashboard } from "./pages/dashboards/LabDashboard";
import { AdminDashboard } from "./pages/dashboards/AdminDashboard";
export default function App() {
    const online = useOnline();
    return (<>
      <OfflineBar online={online}/>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverviewPage />}/>
            <Route path="records" element={<RoleGuard allow={["PATIENT"]}>
                  <DashboardRecordsPage />
                </RoleGuard>}/>
            <Route path="labs" element={<RoleGuard allow={["PATIENT"]}>
                  <DashboardLabsPage />
                </RoleGuard>}/>
            <Route path="appointments" element={<RoleGuard allow={["PATIENT", "CLINICIAN", "ADMIN"]}>
                  <DashboardAppointmentsPage />
                </RoleGuard>}/>
            <Route path="care-team" element={<RoleGuard allow={["PATIENT"]}>
                  <DashboardCareTeamPage />
                </RoleGuard>}/>
            <Route path="patients" element={<RoleGuard allow={["CLINICIAN", "ADMIN"]}>
                  <Outlet />
                </RoleGuard>}>
              <Route index element={<PatientDirectory />}/>
              <Route path=":patientId" element={<PatientChartPage />}/>
            </Route>
            <Route path="upload" element={<RoleGuard allow={["LAB"]}>
                  <LabDashboard />
                </RoleGuard>}/>
            <Route path="admin" element={<RoleGuard allow={["ADMIN"]}>
                  <AdminDashboard />
                </RoleGuard>}/>
          </Route>
        </Route>

        
        <Route path="login" element={<Login />}/>
        <Route path="register" element={<Register />}/>
        <Route path="forgot-password" element={<ForgotPassword />}/>

        <Route element={<Layout />}>
          <Route index element={<Home />}/>
          <Route path="mission" element={<Mission />}/>
          <Route path="*" element={<NotFound />}/>
        </Route>
      </Routes>
    </>);
}
