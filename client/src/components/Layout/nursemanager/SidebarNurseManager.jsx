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

const { Sider } = Layout;

function SidebarNurseManager({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/nurses",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "/students",
      icon: <TeamOutlined />,
      label: "Học sinh",
    },
    {
      key: "/medicines",
      icon: <MedicineBoxOutlined />,
      label: "Thuốc",
    },
    {
      key: "/events",
      icon: <CalendarOutlined />,
      label: "Sự kiện",
    },
    {
      key: "/accounts",
      icon: <UserOutlined />,
      label: "Tài khoản",
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // Add back hover/leave logic
  const handleMouseEnter = () => {
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    setCollapsed(true);
  };

  return (
    <Sider
      trigger={null}
      collapsible={true}
      collapsed={collapsed}
      collapsedWidth={80}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      width={150}
      className={styles.sider}
      theme="dark"
    >
      <div className={styles.logo}>
        <img
          src="https://img.lovepik.com/free-png/20210922/lovepik-icon-of-vector-hospital-png-image_401050686_wh1200.png"
          alt="Logo"
          style={{ height: "100%", width: "100%" }}
        />
      </div>

      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className={styles.menu}
      />
    </Sider>
  );
}

export default SidebarNurseManager;
