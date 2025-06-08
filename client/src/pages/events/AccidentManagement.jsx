/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Dữ liệu giả lập cho các sự cố
const initialAccidents = [
  {
    id: 1,
    studentName: "Nguyễn Văn A",
    class: "5A",
    date: "2024-01-15",
    time: "10:30",
    location: "Sân trường",
    type: "Ngã",
    severity: "Nhẹ",
    description: "Học sinh bị ngã khi chơi đùa trong giờ ra chơi",
    status: "Đã xử lý",
    handledBy: "Y tá Nguyễn Thị B",
    treatment: "Sơ cứu vết thương nhẹ",
    followUp: "Không cần theo dõi thêm",
  },
  {
    id: 2,
    studentName: "Trần Thị B",
    class: "3B",
    date: "2024-01-16",
    time: "14:15",
    location: "Lớp học",
    type: "Đau bụng",
    severity: "Trung bình",
    description: "Học sinh kêu đau bụng dữ dội trong giờ học",
    status: "Đang xử lý",
    handledBy: "Bác sĩ Lê Văn C",
    treatment: "Đang theo dõi và cho uống thuốc",
    followUp: "Cần theo dõi thêm",
  },
  {
    id: 3,
    studentName: "Lê Văn C",
    class: "4C",
    date: "2024-01-17",
    time: "09:45",
    location: "Cầu thang",
    type: "Chấn thương",
    severity: "Nặng",
    description: "Học sinh bị ngã cầu thang, có dấu hiệu chấn thương",
    status: "Đã chuyển viện",
    handledBy: "Y tá Trần Thị D",
    treatment: "Sơ cứu và chuyển đến bệnh viện",
    followUp: "Đang điều trị tại bệnh viện",
  },
];

// Dữ liệu giả lập thống kê
const accidentStats = {
  total: 3,
  bySeverity: [
    { name: "Nhẹ", value: 1, color: "bg-green-500" },
    { name: "Trung bình", value: 1, color: "bg-yellow-500" },
    { name: "Nặng", value: 1, color: "bg-red-500" },
  ],
  byType: [
    { name: "Ngã", value: 1 },
    { name: "Đau bụng", value: 1 },
    { name: "Chấn thương", value: 1 },
  ],
};

export default function AccidentManagement() {
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc sự cố theo trạng thái và từ khóa tìm kiếm
  const filteredAccidents = accidents.filter((accident) => {
    const matchesStatus = activeTab === "all" || accident.status === activeTab;
    const matchesSearch =
      searchTerm === "" ||
      accident.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accident.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accident.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Hiệu ứng khi trang tải
  useEffect(() => {
    // Giả lập tải dữ liệu
    const timer = setTimeout(() => {
      setAccidents(initialAccidents);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Xử lý mở rộng/thu gọn chi tiết sự cố
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

  // Xác định màu sắc dựa vào mức độ nghiêm trọng
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Nhẹ":
        return "bg-green-500";
      case "Trung bình":
        return "bg-yellow-500";
      case "Nặng":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Xác định màu sắc dựa vào trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case "Đã xử lý":
        return "bg-green-500";
      case "Đang xử lý":
        return "bg-blue-500";
      case "Đã chuyển viện":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Quản lý Sự cố Y tế
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Theo dõi và xử lý các sự cố y tế trong trường học
        </p>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Tổng quan
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">
                {accidentStats.total}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tổng số
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {accidentStats.bySeverity.find((s) => s.name === "Nhẹ")
                  ?.value || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Nhẹ
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {accidentStats.bySeverity.find((s) => s.name === "Nặng")
                  ?.value || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Nặng
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs và tìm kiếm */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex overflow-x-auto">
            <button
              className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap transition-colors duration-200
                ${
                  activeTab === "all"
                    ? "bg-primary text-white shadow-md"
                    : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </button>
            <button
              className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap transition-colors duration-200
                ${
                  activeTab === "Đang xử lý"
                    ? "bg-blue-500 text-white shadow-md"
                    : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              onClick={() => setActiveTab("Đang xử lý")}
            >
              Đang xử lý
            </button>
            <button
              className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap transition-colors duration-200
                ${
                  activeTab === "Đã xử lý"
                    ? "bg-green-500 text-white shadow-md"
                    : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              onClick={() => setActiveTab("Đã xử lý")}
            >
              Đã xử lý
            </button>
            <button
              className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap transition-colors duration-200
                ${
                  activeTab === "Đã chuyển viện"
                    ? "bg-red-500 text-white shadow-md"
                    : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              onClick={() => setActiveTab("Đã chuyển viện")}
            >
              Đã chuyển viện
            </button>
          </div>

          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-4 pr-10 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Danh sách sự cố */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Đang tải dữ liệu...
          </p>
        </div>
      ) : filteredAccidents.length === 0 ? (
        <div className="card text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Không tìm thấy sự cố nào{" "}
            {activeTab !== "all" && "trong trạng thái này"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAccidents.map((accident) => (
            <motion.div
              key={accident.id}
              className="card overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => toggleExpand(accident.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {accident.studentName}
                      </h3>
                      <span
                        className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getSeverityColor(
                          accident.severity
                        )}`}
                      >
                        {accident.severity}
                      </span>
                      <span
                        className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(
                          accident.status
                        )}`}
                      >
                        {accident.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {formatDate(accident.date)} - {accident.time}
                    </p>
                  </div>
                  <button className="mt-2 md:mt-0 text-primary dark:text-blue-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 transition-transform ${
                        expandedId === accident.id ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400">
                      Lớp
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {accident.class}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400">
                      Loại sự cố
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {accident.type}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400">
                      Địa điểm
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {accident.location}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400">
                      Người xử lý
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {accident.handledBy}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chi tiết sự cố */}
              {expandedId === accident.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        Mô tả sự cố
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {accident.description}
                      </p>

                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        Xử lý
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {accident.treatment}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        Theo dõi
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {accident.followUp}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                      Xem chi tiết
                    </button>
                    {accident.status === "Đang xử lý" && (
                      <button className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors duration-200">
                        Cập nhật trạng thái
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Nút thêm mới */}
      <div className="mt-8 flex justify-center">
        <button className="btn-primary flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Thêm sự cố mới
        </button>
      </div>
    </div>
  );
}
