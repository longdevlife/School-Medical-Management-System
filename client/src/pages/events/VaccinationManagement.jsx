/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlusOutlined,
  SearchOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

// Giả lập dữ liệu ban đầu
const initialVaccinations = [
  {
    id: 1,
    vaccineName: "BCG (Lao)",
    date: "2023-10-15",
    status: "Đã tiêm",
    note: "Tiêm nhắc lại sau 5 năm",
  },
  {
    id: 2,
    vaccineName: "Viêm gan B",
    date: "2023-11-20",
    status: "Đã tiêm",
    note: "Mũi 1/3",
  },
  {
    id: 3,
    vaccineName: "DPT-VGB-Hib",
    date: "2023-12-25",
    status: "Chưa tiêm",
    note: "Lịch nhắc: 25/12/2023",
  },
];

function VaccinationManagement() {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newVaccine, setNewVaccine] = useState({
    vaccineName: "",
    date: "",
    status: "Chưa tiêm",
    note: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Giả lập việc tải dữ liệu
  useEffect(() => {
    const timer = setTimeout(() => {
      setVaccinations(initialVaccinations);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVaccine((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setNewVaccine({
      vaccineName: "",
      date: "",
      status: "Chưa tiêm",
      note: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newVaccine.vaccineName || !newVaccine.date) {
      alert("Vui lòng nhập tên vaccine và ngày tiêm.");
      return;
    }

    if (editingId) {
      // Cập nhật
      setVaccinations(
        vaccinations.map((vac) =>
          vac.id === editingId ? { ...newVaccine, id: editingId } : vac
        )
      );
    } else {
      // Thêm mới
      setVaccinations([...vaccinations, { ...newVaccine, id: Date.now() }]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (vaccine) => {
    setNewVaccine(vaccine);
    setEditingId(vaccine.id);
    setShowForm(true);

    // Cuộn lên form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const toggleStatus = (id) => {
    setVaccinations((prev) =>
      prev.map((vac) =>
        vac.id === id
          ? {
              ...vac,
              status: vac.status === "Đã tiêm" ? "Chưa tiêm" : "Đã tiêm",
            }
          : vac
      )
    );
  };

  const removeVaccination = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá bản ghi này không?")) {
      setVaccinations((prev) => prev.filter((vac) => vac.id !== id));
    }
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredVaccinations = vaccinations.filter(
    (vac) =>
      vac.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vac.note.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-custom py-8">
      <div className="animate-fadeIn">
        <div className="mb-8">
          <h1 className="section-title">Quản lý Tiêm chủng</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Theo dõi lịch tiêm chủng và cập nhật trạng thái tiêm chủng cho học
            sinh
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Thống kê */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:w-2/3">
            <div className="card bg-primary/10 border-l-4 border-primary flex items-center p-4">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/20 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Tổng số mũi tiêm
                </div>
                <div className="text-2xl font-bold text-primary">
                  {vaccinations.length}
                </div>
              </div>
            </div>

            <div className="card bg-success/10 border-l-4 border-success flex items-center p-4">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-success/20 mr-4">
                <CheckCircleOutlined className="text-2xl text-success" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Đã tiêm
                </div>
                <div className="text-2xl font-bold text-success">
                  {vaccinations.filter((v) => v.status === "Đã tiêm").length}
                </div>
              </div>
            </div>

            <div className="card bg-warning/10 border-l-4 border-warning flex items-center p-4">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-warning/20 mr-4">
                <ClockCircleOutlined className="text-2xl text-warning" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Chưa tiêm
                </div>
                <div className="text-2xl font-bold text-warning">
                  {vaccinations.filter((v) => v.status === "Chưa tiêm").length}
                </div>
              </div>
            </div>
          </div>

          {/* Các nút action */}
          <div className="flex flex-col lg:w-1/3 justify-center space-y-3">
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="btn btn-primary flex items-center justify-center"
            >
              <PlusOutlined className="mr-2" />
              {editingId
                ? "Thêm mũi tiêm mới"
                : showForm
                ? "Ẩn biểu mẫu"
                : "Thêm mũi tiêm mới"}
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-custom pl-10"
              />
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Form nhập liệu */}
        <motion.div
          className="card mb-8"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: showForm ? 1 : 0, height: showForm ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: showForm ? "block" : "none" }}
        >
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Cập nhật thông tin tiêm chủng" : "Thêm mũi tiêm mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="vaccineName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tên vaccine <span className="text-red-500">*</span>
                </label>
                <input
                  id="vaccineName"
                  type="text"
                  name="vaccineName"
                  placeholder="Nhập tên vaccine"
                  value={newVaccine.vaccineName}
                  onChange={handleInputChange}
                  required
                  className="input-custom"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Ngày tiêm <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={newVaccine.date}
                  onChange={handleInputChange}
                  required
                  className="input-custom"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Trạng thái
                </label>
                <select
                  id="status"
                  name="status"
                  value={newVaccine.status}
                  onChange={handleInputChange}
                  className="input-custom"
                >
                  <option value="Chưa tiêm">Chưa tiêm</option>
                  <option value="Đã tiêm">Đã tiêm</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="note"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Ghi chú
                </label>
                <input
                  id="note"
                  type="text"
                  name="note"
                  placeholder="Nhập ghi chú (nếu có)"
                  value={newVaccine.note}
                  onChange={handleInputChange}
                  className="input-custom"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-outline"
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Danh sách tiêm chủng */}
        {loading ? (
          <div className="card p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : filteredVaccinations.length === 0 ? (
          <div className="card text-center py-12">
            <FileTextOutlined className="text-6xl text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Không có dữ liệu tiêm chủng nào{" "}
              {searchTerm && "phù hợp với từ khóa tìm kiếm"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVaccinations.map((vaccine) => (
              <motion.div
                key={vaccine.id}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="p-6 event-item-hover">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          {vaccine.vaccineName}
                        </h3>
                        <span
                          className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${
                            vaccine.status === "Đã tiêm"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {vaccine.status}
                        </span>
                      </div>
                      <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400 text-sm">
                        <CalendarOutlined className="mr-2" />
                        {new Date(vaccine.date).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(vaccine)}
                        className="btn btn-outline btn-sm"
                      >
                        <EditOutlined className="mr-1" />
                        Sửa
                      </button>
                      <button
                        onClick={() => toggleStatus(vaccine.id)}
                        className={`btn btn-sm ${
                          vaccine.status === "Đã tiêm"
                            ? "btn-warning"
                            : "btn-success"
                        }`}
                      >
                        {vaccine.status === "Đã tiêm" ? (
                          <>
                            <ClockCircleOutlined className="mr-1" />
                            Chưa tiêm
                          </>
                        ) : (
                          <>
                            <CheckCircleOutlined className="mr-1" />
                            Đã tiêm
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => removeVaccination(vaccine.id)}
                        className="btn btn-danger btn-sm"
                      >
                        <DeleteOutlined className="mr-1" />
                        Xóa
                      </button>
                    </div>
                  </div>
                  {vaccine.note && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-400">
                        {vaccine.note}
                      </p>
                    </div>
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

export default VaccinationManagement;
