import React from "react";
import { Layout, Menu, Button } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  SettingOutlined,
  UserOutlined,
  HeartOutlined,
  FileTextOutlined,
  BarChartOutlined,
  EditOutlined,
  LineChartOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import authService from "../../../services/authService";
import "./SidebarStyles.css"; // Import đường dẫn CSS tùy chỉnh

const { Sider } = Layout;

function SidebarNurseManager({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = authService.getCurrentUser(); // Lấy thông tin người dùng hiện tại
  const userRole = currentUser ? currentUser.role : null; // Lấy vai trò người dùng

  // Xác định đường dẫn cơ sở theo vai trò
  let basePath = "";
  if (userRole === "NURSE") {
    basePath = "/nurses";
  } else if (userRole === "MANAGER") {
    basePath = "/manager";
  } else if (userRole === "PARENT") {
    basePath = "/parent";
  }

  const menuItems = [
    {
      key: basePath, // Sử dụng đường dẫn cơ sở cho dashboard
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: `${basePath}/profile-view`, // Xem hồ sơ sức khỏe học sinh (chỉ đọc)
      icon: <HeartOutlined />,
      label: "Hồ sơ sức khỏe",
    }, // Menu chỉ dành cho Y TÁ (NURSE)
    ...(userRole === "NURSE"
      ? [
          {
            key: `${basePath}/medication-submission`, // Tiếp nhận & xác minh thuốc từ phụ huynh
            icon: <MedicineBoxOutlined />,
            label: "Tiếp nhận thuốc",
          },
          {
            key: `${basePath}/medical-events`, // Quản lý sự kiện y tế (chỉ dành cho Y TÁ)
            icon: <CalendarOutlined />,
            label: "Sự kiện y tế",
            children: [
              {
                key: `${basePath}/medical-events/vaccination`,
                label: "Quản lý tiêm chủng",
              },
              {
                key: `${basePath}/medical-events/health-checkup`,
                label: "Khám sức khỏe",
              },
              {
                key: `${basePath}/medical-events/accidents`,
                label: "Sự cố y tế",
              },
            ],
          },
        ]
      : []), // Menu chỉ dành cho QUẢN LÝ (MANAGER)
    ...(userRole === "MANAGER"
      ? [
          {
            key: `${basePath}/news-management`, // CRUD blog/bài viết sức khỏe
            icon: <EditOutlined />,
            label: "Quản lý Tin tức",
          },
          {
            key: `${basePath}/reports`, // Tạo và xuất báo cáo
            icon: <BarChartOutlined />,
            label: "Báo cáo",
          },
          {
            key: `${basePath}/advanced-analytics`, // Phân tích xu hướng cho sự kiện y tế
            icon: <LineChartOutlined />,
            label: "Phân tích nâng cao",
          },
        ]
      : []),
    {
      key: `${basePath}/settings`, // Cài đặt tài khoản (quản lý hồ sơ cá nhân)
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
  ]; // Xử lý sự kiện click menu
  const handleMenuClick = ({ key }) => {
    // Điều hướng sử dụng đường dẫn đầy đủ đã xây dựng
    navigate(key);
  };
  return (
    <Sider
      trigger={null}
      collapsible={true}
      collapsed={collapsed}
      collapsedWidth={80}
      width={200}
      className="fixed h-screen left-0 top-0 bottom-0 z-10 transition-all duration-200"
      theme="dark"
      style={{
        background: "linear-gradient(135deg, #47c8f8 0%, #1890ff 100%)",
      }}
    >
      {" "}
      {/*logo bệnh viện */}
      <div className="logoContainer flex justify-center items-center h-24">
        <img
          src="/SchoolMedical.gif"
          alt="School Medical Logo"
          style={{
            height: collapsed ? "5500px" : "5500px",
            width: collapsed ? "auto" : "auto",
            maxWidth: "95%",
            objectFit: "contain",
            margin: "0 auto",
            display: "block",
          }}
        />
      </div>
      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="sidebar-menu border-none bg-transparent"
        style={{
          background: "transparent",
        }}
      />
    </Sider>
  );
}

export default SidebarNurseManager;
