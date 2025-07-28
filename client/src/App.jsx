import ResetPass from "./pages/Forgotpassword/ResetPass";
import ForgotPass from "./pages/Forgotpassword/ForgotPass";
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
import ProtectedRoute from "./components/ProtectedRoute";
{
  /*NURSE LAYOUT */
}
import NurseManagerLayout from "./components/Layout/nursemanager/NurseManagerLayout";
import NurseDashboard from "./pages/nurses/NurseDashboard";
import NurseDashboardNew from "./pages/nurses/NurseDashboardNew";
import HealthProfileView from "./pages/profiles/HealthProfileView";
import MedicationSubmission from "./pages/medications/MedicationSubmission";
import NewsManagement from "./pages/news/NewsManagement";
import VaccinationManagement from "./pages/events/VaccinationManagement";
import HealthCheckManagement from "./pages/events/HealthCheckManagement";
import AccidentManagement from "./pages/events/AccidentManagement";
import Reports from "./pages/reports/Reports";
import AdvancedAnalytics from "./pages/analytics/AdvancedAnalytics";

// Parent Layout
import ParentLayout from "./components/Layout/parent/ParentLayout";
import StudentProfile from "./pages/studentProfile/StudentProfile";
import ParentProfile from "./pages/parent/ParentProfile";
import MedicalEvent from "./pages/eventMedical/MedicalEvent";
import VaccineManagement from "./pages/vaccinationsParent/VaccineManagement";
import VaccineRequest from "./pages/vaccinationsParent/VaccineRequest";
import HealthResult from "./pages/healthRecord/HealthResult";
import MedicineManagement from "./pages/medicineParent/MedicineManagement";
import DeclareHealthProfile from "./pages/decleareParent/DeclareHealthProfile";

import Login from "./pages/Login";
import HomePage from "./pages/home/HomePage";
import AboutPage from "./pages/home/AboutPage";
import NewsPage from "./pages/home/NewsPage";
import SettingUser from "./pages/settings/SettingUser";

function App() {
  return (
    <ConfigProvider>
      <Router>
        <Routes>
          {" "}
          {/* Public Routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/resetpassword" element={<ResetPass />} />
          {/* Admin layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="accounts" element={<AccountList />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* Nurse Route */}
          <Route
            path="/nurses/*"
            element={
              <ProtectedRoute allowedRoles={["NURSE"]}>
                <NurseManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NurseDashboardNew />} />
            <Route path="dashboard" element={<NurseDashboardNew />} />

            <Route path="profile-view" element={<HealthProfileView />} />
            <Route
              path="medication-submission"
              element={<MedicationSubmission />}
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
            <Route path="settings" element={<SettingUser />} />
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

            <Route path="managerDashboard" element={<NurseDashboard />} />

            <Route path="profile-view" element={<HealthProfileView />} />
            <Route path="news-management" element={<NewsManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="advanced-analytics" element={<AdvancedAnalytics />} />
            <Route path="settings" element={<SettingUser />} />
          
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
            <Route path="profileParent" element={<ParentProfile />} />
            <Route path="medical-events" element={<MedicalEvent />} />
            <Route path="Setting" element={<SettingUser />} />
            <Route
              path="vaccinations/results"
              element={<VaccineManagement />}
            />
            <Route
              path="vaccinations/requirements"
              element={<VaccineRequest />}
            />
            <Route path="health-result" element={<HealthResult />} />
            <Route path="send-medicine" element={<MedicineManagement />} />
            <Route path="declare-health" element={<DeclareHealthProfile />} />
          </Route>{" "}
          {/* Redirect root to home page */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
