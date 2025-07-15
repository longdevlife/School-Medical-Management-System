import { useState, useEffect, useCallback } from "react";
import { Avatar, Typography, Button, Spin, Empty, Tooltip } from "antd";
import {
  BellOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import notificationApi from "../../api/notificationApi";
import "./NotificationPanel.css";

const { Text, Title } = Typography;

const NotificationPanel = ({
  notifications: propNotifications,
  onClose,
  onMarkAsRead,
}) => {
  // Use propNotifications if provided, otherwise use local state
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper function to get notification icon and color based on type
  const getNotificationIcon = useCallback((notifyName = "") => {
    const name = notifyName.toLowerCase();

    if (
      name.includes("khám sức khỏe") ||
      name.includes("health") ||
      name.includes("checkup")
    ) {
      return {
        icon: <HeartOutlined className="text-white" />,
        bgColor: "bg-gradient-to-br from-red-400 to-red-500",
        avatarColor: "#ef4444",
      };
    }
    if (
      name.includes("thuốc") ||
      name.includes("medicine") ||
      name.includes("medication")
    ) {
      return {
        icon: <MedicineBoxOutlined className="text-white" />,
        bgColor: "bg-gradient-to-br from-green-400 to-green-500",
        avatarColor: "#22c55e",
      };
    }
    if (
      name.includes("tiêm chủng") ||
      name.includes("vaccination") ||
      name.includes("vaccine")
    ) {
      return {
        icon: <MedicineBoxOutlined className="text-white" />,
        bgColor: "bg-gradient-to-br from-blue-400 to-blue-500",
        avatarColor: "#3b82f6",
      };
    }
    if (
      name.includes("cuộc hẹn") ||
      name.includes("appointment") ||
      name.includes("hẹn")
    ) {
      return {
        icon: <CalendarOutlined className="text-white" />,
        bgColor: "bg-gradient-to-br from-purple-400 to-purple-500",
        avatarColor: "#8b5cf6",
      };
    }

    // Default
    return {
      icon: <BellOutlined className="text-white" />,
      bgColor: "bg-gradient-to-br from-blue-400 to-blue-500",
      avatarColor: "#3b82f6",
    };
  }, []);

  // Format notification time
  const formatNotificationTime = (dateTime) => {
    if (!dateTime) return "Vừa xong";

    const now = new Date();
    const notificationDate = new Date(dateTime);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (notification.unread && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  // Fetch notifications (fallback)
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getNotificationsByUserId();
      const notificationsData = response.data || [];

      const transformedNotifications = notificationsData
        .map((item, index) => {
          const displayTitle = item.title || item.notifyName || "Thông báo";
          const iconConfig = getNotificationIcon(displayTitle);

          return {
            id: item.notifyID || `notify-${index}`,
            title: displayTitle,
            subtitle: item.notifyName || "Thông báo hệ thống",
            message: item.description || "Không có nội dung",
            time: formatNotificationTime(item.dateTime),
            iconConfig,
            unread: true,
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
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [getNotificationIcon]);

  // Transform propNotifications to match expected format
  useEffect(() => {
    if (propNotifications && propNotifications.length > 0) {
      const transformedNotifications = propNotifications
        .map((item) => {
          const displayTitle =
            item.title || item.originalData?.notifyName || "Thông báo";
          const iconConfig = getNotificationIcon(displayTitle);

          return {
            id: item.id,
            title: displayTitle,
            subtitle: item.originalData?.notifyName || "Thông báo hệ thống",
            message: item.message || "Không có nội dung",
            time: item.time,
            iconConfig,
            unread: item.unread,
            originalData: item.originalData,
            dateTime: item.dateTime || item.originalData?.dateTime, // Keep original dateTime for sorting
          };
        })
        .sort((a, b) => {
          // Sort by dateTime descending (newest first)
          const dateA = new Date(a.dateTime || 0);
          const dateB = new Date(b.dateTime || 0);
          return dateB - dateA;
        });

      setNotifications(transformedNotifications);
      setLoading(false);
    } else if (!propNotifications) {
      // Fallback to fetch if no propNotifications provided
      fetchNotifications();
    }
  }, [propNotifications, getNotificationIcon, fetchNotifications]);

  return (
    <div className="w-96 max-h-[600px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl overflow-hidden relative">
      {/* Header */}

      <div className="relative flex items-center justify-center p-5 bg-white bg-opacity-10 backdrop-blur-sm border-b border-white border-opacity-20">
        {/* Bell Icon - Left side */}
        <div className="absolute left-5 w-8 h-8 bg-white bg-opacity-10 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <BellOutlined className="text-white text-lg" />
        </div>

        {/* Title - Center */}
        <Title level={4} className="!text-white !m-0 font-semibold text-xl">
          Thông báo
        </Title>

        {/* Close Button - Right side */}
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          className="!text-white !border-none bg-white bg-opacity-10 rounded-lg w-8 h-8 flex items-center justify-center hover:bg-white hover:bg-opacity-20 absolute right-5"
        />
      </div>

      {/* Notifications List */}
      <div className="bg-white max-h-96 overflow-y-auto rounded-b-2xl notification-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Spin size="large" />
            <Text className="text-gray-600 text-sm">Đang tải thông báo...</Text>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 px-5 text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có thông báo nào"
            />
          </div>
        ) : (
          <div className="p-0">
            {notifications.map((notification, index) => (
              <Tooltip
                key={notification.id}
                title={
                  <div className="max-w-sm">
                    <div className="font-semibold text-gray-800 mb-2">
                      {notification.title}
                    </div>
                    <div className="text-blue-600 text-xs mb-2">
                      {notification.subtitle}
                    </div>
                    <div className="text-gray-600 text-sm leading-relaxed">
                      {notification.message}
                    </div>
                    <div className="text-gray-500 text-xs mt-2">
                      {notification.time}
                    </div>
                  </div>
                }
                placement="left"
                color="white"
                styles={{
                  tooltip: {
                    background: "white",
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                    maxWidth: "350px",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    color: "#333",
                    opacity: 1,
                  },
                }}
                mouseEnterDelay={0.5}
              >
                <div
                  className={`notification-item flex items-start p-5 border-b border-gray-100 cursor-pointer hover:bg-blue-50 relative group ${
                    index === notifications.length - 1 ? "border-b-0" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(90deg, #f8faff 0%, #ffffff 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "";
                  }}
                >
                  {/* Left border indicator on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="mr-4 flex-shrink-0">
                    <Avatar
                      size={48}
                      style={{
                        backgroundColor: notification.iconConfig.avatarColor,
                      }}
                      icon={notification.iconConfig.icon}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Text
                        strong
                        className="text-gray-900 text-sm font-semibold"
                      >
                        {notification.title}
                      </Text>
                      <Text className="text-gray-400 text-xs whitespace-nowrap ml-2">
                        {notification.time}
                      </Text>
                    </div>
                    <Text className="text-blue-600 text-xs font-medium block mb-1">
                      {notification.subtitle}
                    </Text>
                    <Text className="text-gray-600 text-sm leading-5 line-clamp-2">
                      {notification.message}
                    </Text>
                    {/* Unread indicator - only show if unread */}
                    {notification.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
