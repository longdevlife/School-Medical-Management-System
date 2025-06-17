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
import Login from "./pages/Login";

function App() {
  return (
    <ConfigProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="accounts" element={<AccountList />} />
            <Route path="settings" element={<Settings />} />
            <Route path="tin-tuc" element={<News />} />
            <Route path="gioi-thieu" element={<Information />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;