import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd";

// Layout & Pages
import AdminLayout from "./components/Layout/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AccountList from "./pages/accounts/AccountList";
import Settings from "./pages/settings/Settings";
import Home from "./pages/context/HomePages";
import News from "./pages/context/News";
import Information from "./pages/context/Information";
import ProtectedRoute from "./components/ProtectedRoute";
{/*NURSE LAYOUT */}
import NurseManagerLayout from "./components/Layout/nursemanager/NurseManagerLayout";
import NurseDashboard from "./pages/nurses/NurseDashboard";
import HomePage from "./pages/home/HomePage";
import HealthProfileView from "./pages/profiles/HealthProfileView";
import MedicationSubmission from "./pages/medications/MedicationSubmission";
import MedicineEquipmentManagement from "./pages/medicines/MedicineEquipmentManagement";
import NewsManagement from "./pages/news/NewsManagement";
import VaccinationManagement from "./pages/events/VaccinationManagement";
import HealthCheckManagement from "./pages/events/HealthCheckManagement";
import AccidentManagement from "./pages/events/AccidentManagement";
import Reports from "./pages/reports/Reports";
import AdvancedAnalytics from "./pages/analytics/AdvancedAnalytics";
{/*Parent Layout*/}
import ParentLayout from "./components/Layout/parent/ParentLayout";
import StudentProfile from "./pages/studentProfile/StudentProfile";
import ParentProfile from "./pages/parent/ParentProfile";
import MedicalEvent from "./pages/eventMedical/MedicalEvent";
import Vaccine from "./pages/vaccinations/Vaccine";
import VaccineDetail from "./pages/vaccinations/VaccineDetail";
import HealthCheckup from "./pages/healthRecord/HealthCheckup";

import Login from "./pages/Login";

function App() {
  return (
    <ConfigProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Admin layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="accounts" element={<AccountList />} />
            <Route path="settings" element={<Settings />} />
            <Route path="tin-tuc" element={<News />} />
            <Route path="gioi-thieu" element={<Information />} />
          </Route>

          {/* Nurse Routes */}
          <Route
            path="/nurses/*"
            element={
              <ProtectedRoute allowedRoles={["NURSE"]}>
                <NurseManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NurseDashboard />} />
            <Route path="home" element={<HomePage />} />
            <Route path="profile-view" element={<HealthProfileView />} />
            <Route
              path="medication-submission"
              element={<MedicationSubmission />}
            />
            <Route
              path="medicine-equipment"
              element={<MedicineEquipmentManagement />}
            />
            <Route
              path="medical-events/vaccination"
              element={<VaccinationManagement />}
            />
            <Route
              path="medical-events/health-checkup"
              element={<HealthCheckManagement />}
            />
            <Route
              path="medical-events/accidents"
              element={<AccidentManagement />}
            />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* Manager Routes */}
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute allowedRoles={["MANAGER"]}>
                <NurseManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NurseDashboard />} />
            <Route path="home" element={<HomePage />} />
            <Route path="profile-view" element={<HealthProfileView />} />
            <Route path="news-management" element={<NewsManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="advanced-analytics" element={<AdvancedAnalytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/*Parent Route*/}
           <Route
            path="/parent/*"
            element={
              <ProtectedRoute allowedRoles={["PARENT"]}>
                <ParentLayout />
              </ProtectedRoute>
            }
          >
          <Route index element={<ParentProfile />} />
          <Route path="profile-student" element={<StudentProfile />} />
          <Route path="profile" element={<ParentProfile />} />
          <Route path="events" element={<MedicalEvent />} />
          <Route path="vaccinations" element={<Vaccine />} />
          <Route path="vaccinations/:id" element={<VaccineDetail />} />
          <Route path="health-result" element={<HealthCheckup />} />
        </Route>

          {/* Redirect root to login if not authenticated */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
