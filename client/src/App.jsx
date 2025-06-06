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
import StudentList from "./pages/students/StudentList";
import MedicineList from "./pages/medicines/MedicineList";
import AccountList from "./pages/accounts/AccountList";
import Settings from "./pages/settings/Settings";
import Login from "./pages/Login";

import VaccinationManagement from "./pages/events/VaccinationManagement";
import HealthCheckManagement from "./pages/events/HealthCheckManagement";
import AccidentManagement from "./pages/events/AccidentManagement";

import "./App.css";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#47c8f8",
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
            <Route path="students" element={<StudentList />} />
            <Route path="medicines" element={<MedicineList />} />
            <Route
              path="events/vaccination"
              element={<VaccinationManagement />}
            />
            <Route
              path="events/healthcheck"
              element={<HealthCheckManagement />}
            />
            <Route path="events/accident" element={<AccidentManagement />} />
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
            <Route path="students" element={<StudentList />} />
            <Route path="medicines" element={<MedicineList />} />
            <Route path="accounts" element={<AccountList />} />
            <Route
              path="events/vaccination"
              element={<VaccinationManagement />}
            />
            <Route
              path="events/healthcheck"
              element={<HealthCheckManagement />}
            />
            <Route path="events/accident" element={<AccidentManagement />} />
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
