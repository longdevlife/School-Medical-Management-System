import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import ProtectedRoute from "./components/ProtectedRoute";
import { Layout } from "antd";
import ParentLayout from "./components/Layout/parent/ParentLayout";
import StudentProfile from "./pages/studentProfile/StudentProfile";
import ParentProfile from "./pages/parent/ParentProfile";
import MedicalEvent from "./pages/eventMedical/MedicalEvent";
import Vaccine from "./pages/vaccinations/Vaccine";
import VaccineDetail from "./pages/vaccinations/VaccineDetail";
import HealthCheckup from "./pages/healthRecord/HealthCheckup";
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
        
        
        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<Navigate to="/login" replace />} />
        //Login success , redirect to home pages

        
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
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;