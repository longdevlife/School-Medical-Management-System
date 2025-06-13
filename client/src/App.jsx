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

function App() {
  return (
    
    
      <Router>
        <Routes>
          {/* Admin layout luôn bao hết các route */}
          <Route path="/" element={<AdminLayout />}>
            {/* / → Trang chủ trong layout admin */}
            <Route index element={<Home />} />

            {/* Các trang context */}
            <Route path="tin-tuc" element={<News />} />
            <Route path="gioi-thieu" element={<Information />} />

            {/* Trang admin khác */}
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/accounts" element={<AccountList />} />
            <Route path="admin/settings" element={<Settings />} />
          </Route>

          {/* Fallback: nếu không khớp gì → quay về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    
  );
}

export default App;
