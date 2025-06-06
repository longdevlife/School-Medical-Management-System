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
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import styles from "./NurseManagerLayout.module.css";
import authService from '../../../services/authService'; // Correct import path

const { Sider } = Layout;

function SidebarNurseManager({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser(); // Get current user
  const userRole = currentUser ? currentUser.role : null; // Get user role

  // Define base path based on role
  let basePath = '';
  if (userRole === 'NURSE') {
    basePath = '/nurses';
  } else if (userRole === 'MANAGER') {
    basePath = '/manager';
  } else if (userRole === 'PARENT') {
    basePath = '/parent';
  }

  const menuItems = [
    {
      key: basePath, // Use base path for dashboard
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: `${basePath}/students`, // Prepend base path
      icon: <TeamOutlined />,
      label: "Học sinh",
    },
    {
      key: `${basePath}/medicines`, // Prepend base path
      icon: <MedicineBoxOutlined />,
      label: "Thuốc",
    },
    {
      key: `${basePath}/events`, // Prepend base path (or specific event types?)
      icon: <CalendarOutlined />,
      label: "Sự kiện", // This might need to be a submenu
      children: [ // Add submenu for events
        {
          key: `${basePath}/events/vaccination`,
          label: "Tiêm chủng",
        },
        {
          key: `${basePath}/events/healthcheck`,
          label: "Khám sức khỏe",
        },
        {
          key: `${basePath}/events/accident`,
          label: "Sự cố y tế",
        },
      ]
    },
    // Only show Accounts for Manager
    ...(userRole === 'MANAGER' ? [{
      key: `${basePath}/accounts`, // Prepend base path
      icon: <UserOutlined />,
      label: "Tài khoản",
    }] : []),
    {
      key: `${basePath}/settings`, // Prepend base path
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
  ];

  const handleMenuClick = ({ key }) => {
    // Navigate using the full constructed path
    navigate(key);
  };

  // Add back hover/leave logic
  const handleMouseEnter = () => {
     // Only expand on hover if collapsed
    if (collapsed) {
       setCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
     // Only collapse on leave if not originally expanded
     // This prevents it from collapsing if user intentionally expanded it
     // For simplicity, let's just collapse on leave for now.
     // A more complex state management would be needed for intentional expand.
     setCollapsed(true);
  };

  return (
    <Sider
      trigger={null}
      collapsible={true}
      collapsed={collapsed}
      collapsedWidth={80}
      onMouseEnter={handleMouseEnter} // Enable hover to expand
      onMouseLeave={handleMouseLeave} // Enable leave to collapse
      width={200} // Set expanded width
      className={styles.sider}
      theme="dark"
    >
      <div className={styles.logo} /* Remove hardcoded image if not using */ >
         {/* You can add a logo component or image here if needed */}
         {/* For now, keeping it empty or adding placeholder text */}
         {!collapsed && <span style={{ color: 'white', textAlign: 'center' }}>Logo Area</span>}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={collapsed}
        // Use location.pathname to correctly highlight selected key
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className={styles.menu}
      />
    </Sider>
  );
}

export default SidebarNurseManager;
