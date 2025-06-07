import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import ParentLayout from "./components/Layout/ParentLayout";
import StudentProfile from "./pages/studentProfile/StudentProfile";
import ParentProfile from "./pages/parent/ParentProfile";
import MedicalEvent from "./pages/eventMedical/MedicalEvent";
import Vaccine from "./pages/vaccinations/Vaccine";
import VaccineDetail from "./pages/vaccinations/VaccineDetail";
import HealthCheckup from "./pages/healthRecord/HealthCheckup";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/parent/profile" replace />} />
        
        <Route path="/parent" element={<ParentLayout />}>
          <Route index element={<ParentProfile />} />
          <Route path="profile-student" element={<StudentProfile />} />
          <Route path="profile" element={<ParentProfile />} />
          <Route path="events" element={<MedicalEvent />} />
          <Route path="vaccinations" element={<Vaccine />} />
          <Route path="vaccinations/:id" element={<VaccineDetail />} />
          <Route path="health-result" element={<HealthCheckup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;