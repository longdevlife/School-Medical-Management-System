import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Input,
  Button,
  Space,
  Avatar,
  Dropdown,
  Badge,
  List,
  Typography,
  message,
  Spin,
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
import "./Header.css";

const { Header } = Layout;
const { Text } = Typography;

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
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [hasShownInitialToasts, setHasShownInitialToasts] = useState(false);

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

  // Function to mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setNotificationLoading(true);

      const response = await notificationApiService.getNotificationsByUserId();
      const notificationsData = response.data || [];

      const transformedNotifications = notificationsData.map((item, index) => {
        const displayTitle = item.title || item.notifyName || "Thông báo";

        return {
          id: item.notifyID || `notify-${index}`,
          title: displayTitle,
          message: item.description || "Không có nội dung",
          time: formatNotificationTime(item.dateTime),
          iconData: getNotificationIcon(displayTitle),
          unread: true,
          originalData: item,
        };
      });

      setNotifications(transformedNotifications);

      if (transformedNotifications.length > 0 && !hasShownInitialToasts) {
        const latestNotifications = transformedNotifications.slice(0, 3);

        latestNotifications.forEach((notification, index) => {
          setTimeout(() => {
            showToastNotification(notification.originalData);
          }, (index + 1) * 1500);
        });
        setHasShownInitialToasts(true);
      }
    } catch (error) {
      message.error("Không thể tải thông báo. Vui lòng thử lại!");
      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  }, [
    isAuthenticated,
    showToastNotification,
    hasShownInitialToasts,
    setHasShownInitialToasts,
    getNotificationIcon,
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

  // Load notifications when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Notification dropdown content
  const notificationDropdown = (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Text strong className="text-lg">
            Thông báo
          </Text>
          <div className="flex items-center space-x-2">
            <Text className="text-xs text-gray-500">
              {notifications.length > 0 && `${unreadCount} mới`}
            </Text>
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchNotifications();
              }}
              disabled={notificationLoading}
              className="text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
              title="Tải lại thông báo"
            >
              {notificationLoading ? (
                <Spin size="small" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto scrollbar-hide">
        {notificationLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="small" />
            <Text className="ml-2 text-gray-500">Đang tải...</Text>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <BellOutlined className="text-2xl mb-2 opacity-50" />
            <Text className="text-sm">Không có thông báo nào</Text>
          </div>
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${
                  item.unread ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  // Show toast notification with full details
                  showToastNotification(item.originalData);

                  // Mark notification as read (reduce unread count)
                  markNotificationAsRead(item.id);

                  // TODO: Handle navigation or other actions
                }}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${item.iconData.bgColor} ${item.iconData.borderColor}`}
                  >
                    <span className="text-lg">{item.iconData.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Text strong={item.unread} className="text-sm">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-gray-400">{item.time}</Text>
                    </div>
                    <Text className="text-sm text-gray-600 block mt-1 line-clamp-2">
                      {item.message}
                    </Text>
                    {item.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 text-center">
          <Button
            type="link"
            className="text-blue-500 font-medium"
            onClick={() => {
              // TODO: Navigate to notifications page
            }}
          >
            Xem tất cả thông báo
          </Button>
        </div>
      )}
    </div>
  );

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
            <img
              src="/favicon.svg"
              alt="School Logo"
              className="w-10 h-10 mr-3"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
              Y Tế Học Đường
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
              className="font-medium border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              Vào hệ thống
            </Button>
          )}

          {/* Notification Bell - Only for authenticated users */}
          {isAuthenticated && (
            <Dropdown
              overlay={notificationDropdown}
              placement="bottomRight"
              trigger={["click"]}
              arrow
            >
              <div className="cursor-pointer">
                <Badge count={unreadCount} size="small">
                  <BellOutlined className="text-xl text-gray-600 hover:text-blue-600 transition-colors duration-200" />
                </Badge>
              </div>
            </Dropdown>
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
