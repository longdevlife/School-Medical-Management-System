import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Input,
  Button,
  Space,
  Avatar,
  Dropdown,
  Badge,
  notification,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  ExperimentOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import notificationApiService from "../../api/notificationApi";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import NotificationPanel from "../Notification/NotificationPanel";
import "./Header.css";

const { Header } = Layout;

function AppHeader({ collapsed, setCollapsed }) {
  const navigate = useNavigate();

  // Ant Design notification hook
  const [notificationApi, contextHolder] = notification.useNotification();

  // Get current user info
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser ? currentUser.role : null;

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [hasShownInitialToasts, setHasShownInitialToasts] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    // Load read notifications from localStorage
    const saved = localStorage.getItem("readNotifications");
    return saved ? JSON.parse(saved) : [];
  });

  // Helper function to get notification icon and color based on type
  const getNotificationIcon = useCallback((notifyName = "") => {
    const name = notifyName.toLowerCase();

    if (
      name.includes("khám sức khỏe") ||
      name.includes("health") ||
      name.includes("checkup")
    ) {
      return {
        icon: <HeartOutlined className="text-red-500" />,
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    }
    if (
      name.includes("thuốc") ||
      name.includes("medicine") ||
      name.includes("medication")
    ) {
      return {
        icon: <MedicineBoxOutlined className="text-green-500" />,
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    }
    if (
      name.includes("sự cố") ||
      name.includes("emergency") ||
      name.includes("accident") ||
      name.includes("incident")
    ) {
      return {
        icon: <ExclamationCircleOutlined className="text-orange-500" />,
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      };
    }
    if (
      name.includes("tiêm chủng") ||
      name.includes("vaccine") ||
      name.includes("vaccination")
    ) {
      return {
        icon: <ExperimentOutlined className="text-blue-500" />,
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      };
    }

    // Default for general notifications
    return {
      icon: <FileProtectOutlined className="text-gray-500" />,
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    };
  }, []);

  // Function to mark notification as read
  const markNotificationAsRead = useCallback(
    (notificationId) => {
      const updatedReadNotifications = [...readNotifications, notificationId];
      setReadNotifications(updatedReadNotifications);
      localStorage.setItem(
        "readNotifications",
        JSON.stringify(updatedReadNotifications)
      );

      // Update notifications state to reflect read status
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, unread: false }
            : notification
        )
      );
    },
    [readNotifications]
  );

  // Function to show toast notification
  const showToastNotification = useCallback(
    (item) => {
      const iconConfig = getNotificationIcon(
        item.title || item.notifyName || "Thông báo"
      );

      notificationApi.open({
        message: item.title || "Thông báo mới",
        description: (
          <div className="space-y-2">
            {item.notifyName && (
              <div>
                <strong className="text-blue-600">Loại:</strong>{" "}
                {item.notifyName}
              </div>
            )}
            {item.description && (
              <div>
                <strong className="text-gray-600">Chi tiết:</strong>{" "}
                {item.description}
              </div>
            )}
          </div>
        ),
        icon: iconConfig.icon,
        showProgress: true,
        pauseOnHover: true,
        placement: "topRight",
        duration: 6,
        className: "custom-notification",
      });
    },
    [notificationApi, getNotificationIcon]
  );

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await notificationApiService.getNotificationsByUserId();
      const notificationsData = response.data || [];

      const transformedNotifications = notificationsData
        .map((item, index) => {
          const displayTitle = item.title || item.notifyName || "Thông báo";
          const notificationId = item.notifyID || `notify-${index}`;

          return {
            id: notificationId,
            title: displayTitle,
            message: item.description || "Không có nội dung",
            time: formatNotificationTime(item.dateTime),
            iconData: getNotificationIcon(displayTitle),
            unread: !readNotifications.includes(notificationId), // Check if already read
            originalData: item,
            dateTime: item.dateTime, // Keep original dateTime for sorting
          };
        })
        .sort((a, b) => {
          // Sort by dateTime descending (newest first)
          const dateA = new Date(a.dateTime || 0);
          const dateB = new Date(b.dateTime || 0);
          return dateB - dateA;
        });

      setNotifications(transformedNotifications);

      if (transformedNotifications.length > 0 && !hasShownInitialToasts) {
        // Get the 3 most recent notifications (already sorted by newest first)
        const latestNotifications = transformedNotifications.slice(0, 3);

        latestNotifications.forEach((notification, index) => {
          setTimeout(() => {
            showToastNotification(notification.originalData);
          }, (index + 1) * 1500);
        });
        setHasShownInitialToasts(true);
      }
    } catch (error) {
      setNotifications([]);
    }
  }, [
    isAuthenticated,
    showToastNotification,
    hasShownInitialToasts,
    setHasShownInitialToasts,
    getNotificationIcon,
    readNotifications,
  ]);

  // Helper function to format notification time
  const formatNotificationTime = (dateTimeString) => {
    if (!dateTimeString) return "Vừa xong";

    try {
      const notifyDate = new Date(dateTimeString);
      const now = new Date();
      const diffMs = now - notifyDate;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return notifyDate.toLocaleDateString("vi-VN");
    } catch (error) {
      return "Vừa xong";
    }
  };

  // Setup auto refresh cho thông báo - chỉ khi đã đăng nhập
  useAutoRefresh(
    () => {
      if (isAuthenticated) {
        fetchNotifications();
      }
    },
    60000,
    isAuthenticated
  ); // 60 giây, chỉ khi đã đăng nhập

  // Load notifications when user logs in, clear when logout
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      // Clear notifications and read status when user logs out
      setNotifications([]);
      setReadNotifications([]);
      setHasShownInitialToasts(false);
    }
  }, [isAuthenticated, fetchNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // User dropdown menu items
  const userMenuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
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
      // Clear notification read status when logout
      localStorage.removeItem("readNotifications");
      authService.logout();
      navigate("/login");
    } else if (key === "dashboard") {
      // Navigate to appropriate dashboard based on role
      switch (userRole) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "MANAGER":
          navigate("/manager");
          break;
        case "NURSE":
          navigate("/nurses");
          break;
        case "PARENT":
          navigate("/parent");
          break;
        default:
          navigate("/login");
      }
    } else if (key === "settings") {
      // Navigate to settings based on role
      switch (userRole) {
        case "ADMIN":
          navigate("/admin/settings");
          break;
        case "MANAGER":
          navigate("/manager/settings");
          break;
        case "NURSE":
          navigate("/nurses/settings");
          break;
        case "PARENT":
          navigate("/parent/setting");
          break;
        default:
          navigate("/login");
      }
    }
  };
  return (
    <>
      {contextHolder}
      <Header className="bg-white shadow-md border-b border-gray-200 px-6 h-16 flex items-center sticky top-0 z-50">
        {/* Left Section - Collapse toggle + Logo */}
        <div className="flex items-center flex-shrink-0">
          {isAuthenticated && setCollapsed && (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="mr-4 text-gray-600 hover:text-blue-600"
            />
          )}
          <div
            className="flex items-center cursor-pointer whitespace-nowrap"
            onClick={() => {
              if (isAuthenticated) {
                // Navigate to appropriate dashboard based on role
                switch (userRole) {
                  case "ADMIN":
                    navigate("/admin");
                    break;
                  case "MANAGER":
                    navigate("/manager");
                    break;
                  case "NURSE":
                    navigate("/nurses");
                    break;
                  case "PARENT":
                    navigate("/parent");
                    break;
                  default:
                    navigate("/home");
                }
              } else {
                navigate("/home");
              }
            }}
          >
            <span className="text-2xl font-bold text-gray-900 tracking-tight whitespace-nowrap">
              Y Tế Học Đường<span className="text-blue-600">.</span>
            </span>
          </div>
        </div>

        {/* Center Section - Navigation Menu */}
        <div className="flex-1 flex justify-center">
          <nav className="flex items-center space-x-8">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium whitespace-nowrap focus:outline-none"
              tabIndex={0}
              onMouseDown={(e) => e.preventDefault()}
            >
              <HomeOutlined className="mr-2" />
              Trang chủ
            </button>

            <button
              onClick={() => navigate("/tin-tuc")}
              className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium whitespace-nowrap focus:outline-none"
              tabIndex={0}
              onMouseDown={(e) => e.preventDefault()}
            >
              <FileTextOutlined className="mr-2" />
              Tin tức
            </button>

            <button
              onClick={() => navigate("/gioi-thieu")}
              className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium whitespace-nowrap focus:outline-none"
              tabIndex={0}
              onMouseDown={(e) => e.preventDefault()}
            >
              <InfoCircleOutlined className="mr-2" />
              Giới thiệu
            </button>
          </nav>
        </div>
        {/* Right Section - Login/User */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Dashboard Button for authenticated users */}
          {isAuthenticated && (
            <Button
              type="default"
              icon={<DashboardOutlined />}
              onClick={() => {
                switch (userRole) {
                  case "ADMIN":
                    navigate("/admin");
                    break;
                  case "MANAGER":
                    navigate("/manager");
                    break;
                  case "NURSE":
                    navigate("/nurses");
                    break;
                  case "PARENT":
                    navigate("/parent");
                    break;
                  default:
                    navigate("/login");
                }
              }}
              className="border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 font-medium h-9 px-4 transition-colors duration-200"
            >
              Vào hệ thống
            </Button>
          )}

          {/* Notification Bell - Only for authenticated users */}
          {isAuthenticated && (
            <div className="relative notification-panel-container">
              <div
                className="cursor-pointer"
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              >
                <Badge count={unreadCount} size="small">
                  <BellOutlined className="text-xl text-gray-600 hover:text-blue-600 transition-colors duration-200" />
                </Badge>
              </div>

              {/* Notification Panel */}
              {showNotificationPanel && (
                <>
                  <div
                    className="notification-overlay"
                    onClick={() => setShowNotificationPanel(false)}
                  />
                  <div className="absolute top-12 right-0 z-50">
                    <NotificationPanel
                      notifications={notifications}
                      onClose={() => setShowNotificationPanel(false)}
                      onMarkAsRead={markNotificationAsRead}
                      onNavigateToSystem={() => {
                        setShowNotificationPanel(false);
                        // Navigate to appropriate dashboard based on role
                        switch (userRole) {
                          case "ADMIN":
                            navigate("/admin");
                            break;
                          case "MANAGER":
                            navigate("/manager");
                            break;
                          case "NURSE":
                            navigate("/nurses");
                            break;
                          case "PARENT":
                            navigate("/parent");
                            break;
                          default:
                            navigate("/login");
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          {/* Login Button or User Dropdown */}
          {isAuthenticated ? (
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
              arrow
              trigger={["click"]}
            >
              <div
                className="flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none"
                tabIndex={0}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Avatar icon={<UserOutlined />} className="bg-blue-500" />
                <span className="text-gray-700 font-medium whitespace-nowrap">
                  Xin chào, {currentUser?.username || userRole}
                </span>
              </div>
            </Dropdown>
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 h-10 px-6 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              Đăng nhập
            </Button>
          )}
        </div>
      </Header>
    </>
  );
}

export default AppHeader;
