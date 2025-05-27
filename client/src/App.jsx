import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import LoginRegister from "./pages/auth/LoginRegister";
import StudentList from "./pages/students/StudentList";
import MedicineList from "./pages/medicines/MedicineList";
import AccountList from "./pages/accounts/AccountList";
import Settings from "./pages/settings/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<StudentList />} />
          <Route path="medicines" element={<MedicineList />} />
          <Route path="accounts" element={<AccountList />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
