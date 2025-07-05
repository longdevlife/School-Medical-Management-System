/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  FileTextOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";

// Dữ liệu giả lập cho các đợt khám sức khỏe
const initialHealthChecks = [
  {
    id: 1,
    name: "Khám sức khỏe đầu năm 2023-2024",
    startDate: "2023-08-15",
    endDate: "2023-08-30",
    status: "Đã hoàn thành",
    location: "Trung tâm Y tế Quận 1",
    description: "Khám sức khỏe tổng quát đầu năm học cho học sinh các khối",
    participants: 1250,
    progress: 100,
  },
  {
    id: 2,
    name: "Kiểm tra mắt & răng miệng",
    startDate: "2023-10-10",
    endDate: "2023-10-20",
    status: "Đang diễn ra",
    location: "Tại trường",
    description:
      "Kiểm tra sức khỏe chuyên sâu về mắt và răng miệng cho học sinh",
    participants: 980,
    progress: 65,
  },
  {
    id: 3,
    name: "Khám sức khỏe định kỳ giữa năm",
    startDate: "2024-01-15",
    endDate: "2024-01-25",
    status: "Sắp diễn ra",
    location: "Bệnh viện Nhi Đồng",
    description: "Khám sức khỏe định kỳ giữa năm học cho học sinh các khối",
    participants: 1350,
    progress: 0,
  },
];

// Dữ liệu giả lập thông tin sức khỏe
const healthMetrics = [
  { name: "Thể lực tốt", value: 68, color: "bg-green-500" },
  { name: "Thể lực trung bình", value: 25, color: "bg-yellow-500" },
  { name: "Cần cải thiện", value: 7, color: "bg-red-500" },
];

export default function HealthCheckManagement() {
  const [healthChecks, setHealthChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Lọc đợt khám theo trạng thái
  const filteredHealthChecks = healthChecks.filter((check) => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return check.status === "Đã hoàn thành";
    if (activeTab === "ongoing") return check.status === "Đang diễn ra";
    if (activeTab === "upcoming") return check.status === "Sắp diễn ra";
    return true;
  });

  // Hiệu ứng khi trang tải
  useEffect(() => {
    // Giả lập tải dữ liệu
    const timer = setTimeout(() => {
      setHealthChecks(initialHealthChecks);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Xử lý mở rộng/thu gọn chi tiết đợt khám
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Xác định màu sắc dựa vào trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case "Đã hoàn thành":
        return "bg-green-500";
      case "Đang diễn ra":
        return "bg-blue-500";
      case "Sắp diễn ra":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="animate-fadeIn">
        <div className="mb-8">
          <h1 className="section-title">Quản lý Khám Sức khỏe Định kỳ</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Lập kế hoạch, tổ chức và theo dõi các đợt khám sức khỏe định kỳ cho
            học sinh
          </p>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-primary/10 border-l-4 border-primary">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Thông tin các đợt khám
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {healthChecks.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Tổng số
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success mb-1">
                    {
                      healthChecks.filter(
                        (check) => check.status === "Đã hoàn thành"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Hoàn thành
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary mb-1">
                    {
                      healthChecks.filter(
                        (check) => check.status === "Đang diễn ra"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Đang diễn ra
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-success/10 border-l-4 border-success">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Học sinh tham gia
              </h3>
              <div className="flex items-center justify-center">
                <TeamOutlined className="text-4xl text-success mr-4" />
                <div className="text-4xl font-bold text-success">
                  {healthChecks
                    .reduce((sum, check) => sum + check.participants, 0)
                    .toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-secondary/10 border-l-4 border-secondary">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Tình trạng sức khỏe
              </h3>
              <div className="space-y-3">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-4">
                      <div
                        className={`h-2.5 rounded-full ${metric.color}`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {metric.name} ({metric.value}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex overflow-x-auto">
          <button
            className={`btn ${
              activeTab === "all" ? "btn-primary" : "btn-outline"
            } mr-2`}
            onClick={() => setActiveTab("all")}
          >
            Tất cả
          </button>
          <button
            className={`btn ${
              activeTab === "ongoing" ? "btn-secondary" : "btn-outline"
            } mr-2`}
            onClick={() => setActiveTab("ongoing")}
          >
            Đang diễn ra
          </button>
          <button
            className={`btn ${
              activeTab === "completed" ? "btn-success" : "btn-outline"
            } mr-2`}
            onClick={() => setActiveTab("completed")}
          >
            Đã hoàn thành
          </button>
          <button
            className={`btn ${
              activeTab === "upcoming" ? "btn-warning" : "btn-outline"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Sắp diễn ra
          </button>
        </div>

        {/* Danh sách các đợt khám */}
        {loading ? (
          <div className="card p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : filteredHealthChecks.length === 0 ? (
          <div className="card text-center py-12">
            <FileTextOutlined className="text-6xl text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Không có đợt khám sức khỏe nào{" "}
              {activeTab !== "all" && "trong trạng thái này"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHealthChecks.map((check) => (
              <motion.div
                key={check.id}
                className="card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="p-6 cursor-pointer event-item-hover"
                  onClick={() => toggleExpand(check.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          {check.name}
                        </h3>
                        <span
                          className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(
                            check.status
                          )}`}
                        >
                          {check.status}
                        </span>
                      </div>
                      <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400 text-sm">
                        <CalendarOutlined className="mr-2" />
                        {formatDate(check.startDate)} -{" "}
                        {formatDate(check.endDate)}
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 flex items-center">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">
                        {check.progress}% hoàn thành
                      </div>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            check.progress === 100
                              ? "bg-success"
                              : check.progress > 50
                              ? "bg-secondary"
                              : check.progress > 0
                              ? "bg-warning"
                              : "bg-gray-300"
                          }`}
                          style={{ width: `${check.progress}%` }}
                        ></div>
                      </div>
                      {expandedId === check.id ? (
                        <UpOutlined className="ml-4 text-primary" />
                      ) : (
                        <DownOutlined className="ml-4 text-primary" />
                      )}
                    </div>
                  </div>

                  {expandedId === check.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                            <EnvironmentOutlined className="mr-2" />
                            Địa điểm: {check.location}
                          </p>
                          <p className="flex items-center text-gray-600 dark:text-gray-400">
                            <TeamOutlined className="mr-2" />
                            Số học sinh tham gia:{" "}
                            {check.participants.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            {check.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-3">
                        <button className="btn btn-outline">
                          Xem chi tiết
                        </button>
                        <button className="btn btn-primary">Cập nhật</button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}