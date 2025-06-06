import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import viVN from "antd/lib/locale/vi_VN";
import ProtectedRoute from "./components/ProtectedRoute";
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
import AccountList from "./pages/accounts/AccountList";
import Settings from "./pages/settings/Settings";
import Login from "./pages/Login";

import "./App.css";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0F6CBD",
          borderRadius: 6,
        },
      }}
      locale={viVN}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

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

          {/* Parent Routes */}

          {/* Redirect root to login if not authenticated */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
