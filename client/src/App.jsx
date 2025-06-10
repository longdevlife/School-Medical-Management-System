// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd";

import AdminLayout from "./components/Layout/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AccountList from "./pages/accounts/AccountList";
import Settings from "./pages/settings/Settings";

function App() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            siderBg: "#2196f3",
            triggerBg: "#001529",
            triggerColor: "#fff",
          },
          Menu: {
            darkItemBg: "#2196f3",
            darkItemSelectedBg: "#1890ff",
            darkItemHoverBg: "rgba(74, 65, 65, 0)",
          },
        },
      }}
    >
      <Router>
        <Routes>
          {/* Khi truy cập gốc "/" → redirect sang "/admin/dashboard" */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Admin Router */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* /admin → redirect tới /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />

            {/* /admin/dashboard → render trang Dashboard */}
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* /admin/accounts → render AccountList */}
            <Route path="accounts" element={<AccountList />} />

            {/* /admin/settings → render Settings */}
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Nếu không có route nào match, redirect về /admin/dashboard */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
