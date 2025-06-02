import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import viVN from "antd/lib/locale/vi_VN";
import NurseManagerLayout from "./components/Layout/nursemanager/NurseManagerLayout";
import NurseDashboard from "./pages/nurses/NurseDashboard";
import StudentList from "./pages/students/StudentList";
import MedicineList from "./pages/medicines/MedicineList";
import EventsPage from "./pages/events/EventsPage";
import Settings from "./pages/settings/Settings";
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
          <Route path="/" element={<NurseManagerLayout />}>
            <Route path="nurses" element={<NurseDashboard />} />
            <Route path="students" element={<StudentList />} />
            <Route path="medicines" element={<MedicineList />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
export default App;
