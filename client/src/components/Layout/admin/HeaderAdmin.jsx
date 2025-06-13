import React from "react";
import { Layout, Button, Space, Avatar, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./AdminLayout.module.css";
import {
  HomeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

function HeaderAdmin({ collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const userMenuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "accounts",
      icon: <UserOutlined />,
      label: "Tài khoản",
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
    if (key === "logout") {
      navigate("/admin/dashboard");
    } else {
      navigate(`/admin/${key}`);
    }
  };

  // Điều hướng cho các liên kết ở giữa
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Header className={styles.header}>
      <div className={styles.leftSection}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className={styles.trigger}
        />
      </div>

    <div className={styles.centerMenu}>
      <Space size="middle">
        <span className={styles.menuLink} onClick={() => navigate("/")}>
          <HomeOutlined style={{ marginRight: 6 }} />
          Trang chủ
        </span>
        <span className={styles.menuLink} onClick={() => navigate("/tin-tuc")}>
          <FileTextOutlined style={{ marginRight: 6 }} />
          Tin tức
        </span>
        <span className={styles.menuLink} onClick={() => navigate("/gioi-thieu")}>
          <InfoCircleOutlined style={{ marginRight: 6 }} />
          Giới thiệu
        </span>
      </Space>
    </div>


      <div className={styles.rightSection}>
        <Space>
          <Button type="text" icon={<BellOutlined />} />
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
            arrow
          >
            <Space className={styles.userInfo} style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} />
              <span className={styles.userName}>Admin</span>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
}

export default HeaderAdmin;
