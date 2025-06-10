import React, { useRef } from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import styles from "./AdminLayout.module.css";

const { Sider } = Layout;

function SidebarAdmin({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hoverTimeout = useRef(null);

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/accounts",
      icon: <UserOutlined />,
      label: "Tài khoản",
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setCollapsed(false), 100); 
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setCollapsed(true), 300); 
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      collapsedWidth={80}
      className={styles.sider}
      theme="dark"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.logo}>
        <img src="https://img.lovepik.com/free-png/20210922/lovepik-icon-of-vector-hospital-png-image_401050686_wh1200.png" />
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

export default SidebarAdmin;