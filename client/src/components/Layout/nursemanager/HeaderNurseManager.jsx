import React from "react";
import { Layout, Button, Space, Avatar, Dropdown, Input } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../../services/authService";
import styles from "./NurseManagerLayout.module.css";

const { Header } = Layout;
const { Search } = Input;

function HeaderNurseManager({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser ? currentUser.role : "USER";

  // Lấy tên hiển thị cho vai trò
  const getRoleDisplayName = (role) => {
    switch (role) {
      case "NURSE":
        return "Y tá";
      case "MANAGER":
        return "Quản lý";
      case "PARENT":
        return "Phụ huynh";
      default:
        return "Người dùng";
    }
  };

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
        navigate("/login");
        break;
      default:
        break;
    }
  };

  // Xác định đường dẫn home dựa trên role
  const getHomeRoute = () => {
    if (userRole === "NURSE") {
      return "/nurses/home";
    } else if (userRole === "MANAGER") {
      return "/manager/home";
    } else if (userRole === "PARENT") {
      return "/parent/home";
    }
    return "/";
  };

  const onSearch = (value) => {
    console.log("Search:", value);
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
        <div className={styles.logoContainer}>
          {/* Logo placeholder or alternative content */}
        </div>
        <Search
          placeholder="Tìm kiếm..."
          onSearch={onSearch}
          style={{ width: 200 }}
          className={styles.searchBar}
        />
      </div>{" "}
      <nav className={styles.mainNav}>
        <Link to={getHomeRoute()} className={styles.navLink}>
          Trang chủ
        </Link>
        <Link to="/news" className={styles.navLink}>
          Tin tức
        </Link>
        <Link to="/about" className={styles.navLink}>
          Giới thiệu
        </Link>
      </nav>
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
              <span className={styles.userName}>
                {getRoleDisplayName(userRole)}
              </span>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
}
export default HeaderNurseManager;
