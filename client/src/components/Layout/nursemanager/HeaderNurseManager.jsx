import React from "react";
import { Layout, Button, Space, Avatar, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./NurseManagerLayout.module.css";

const { Header } = Layout;

function HeaderNurseManager({ collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
    },
  ];

  const handleUserMenuClick = ({ key }) => {
    switch (key) {
      case "profile":
        navigate("/profile");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "logout":
        // Handle logout logic here
        navigate("/login");
        break;
      default:
        break;
    }
  };

  return (
    <Header className={styles.header}>
      <div className={styles.headerLeft}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className={styles.trigger}
        />
      </div>
      <div className={styles.headerRight}>
        <Space size="large">
          <Button
            type="text"
            icon={<BellOutlined />}
            className={styles.notificationButton}
          />
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleUserMenuClick,
            }}
            placement="bottomRight"
            arrow
          >
            <Space className={styles.userInfo}>
              <Avatar icon={<UserOutlined />} />
              <span className={styles.userName}>Y tá</span>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
}
export default HeaderNurseManager;
