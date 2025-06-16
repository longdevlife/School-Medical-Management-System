/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, List, Tag, Button, Space, Tabs } from "antd";
import {
  CalendarOutlined,
  PlusOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  TagOutlined,
} from "@ant-design/icons";
import AccidentManagement from "./AccidentManagement";
import HealthCheckManagement from "./HealthCheckManagement";
import VaccinationManagement from "./VaccinationManagement";

const { TabPane } = Tabs;

const EventsPage = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Khám sức khỏe định kỳ",
      date: "2024-03-15",
      time: "08:00 - 11:00",
      location: "Phòng y tế",
      type: "Khám sức khỏe",
      status: "Sắp diễn ra",
      description: "Khám sức khỏe tổng quát cho học sinh toàn trường",
    },
    {
      id: 2,
      title: "Tư vấn dinh dưỡng",
      date: "2024-03-20",
      time: "14:00 - 16:00",
      location: "Hội trường",
      type: "Tư vấn",
      status: "Sắp diễn ra",
      description: "Buổi tư vấn về dinh dưỡng cho học sinh và phụ huynh",
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sự kiện này?")) {
      setEvents(events.filter((event) => event.id !== id));
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-custom py-8">
      <div className="animate-fadeIn">
        <div className="mb-8">
          <h1 className="section-title">Quản lý Sự kiện</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Theo dõi và quản lý các sự kiện y tế trong trường học
          </p>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-primary/10 border-l-4 border-primary">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tổng số sự kiện
              </h3>
              <p className="text-3xl font-bold text-primary">{events.length}</p>
            </div>
          </div>

          <div className="card bg-success/10 border-l-4 border-success">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Sắp diễn ra
              </h3>
              <p className="text-3xl font-bold text-success">
                {
                  events.filter((event) => event.status === "Sắp diễn ra")
                    .length
                }
              </p>
            </div>
          </div>

          <div className="card bg-secondary/10 border-l-4 border-secondary">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Đang diễn ra
              </h3>
              <p className="text-3xl font-bold text-secondary">
                {
                  events.filter((event) => event.status === "Đang diễn ra")
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        {/* Thanh tìm kiếm và nút thêm mới */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={handleAddEvent}
            className="btn btn-primary flex items-center"
          >
            <PlusOutlined className="mr-2" />
            Thêm sự kiện mới
          </button>
        </div>

        {/* Danh sách sự kiện */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              className="card hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {event.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.status === "Sắp diễn ra"
                      ? "bg-warning/20 text-warning"
                      : event.status === "Đang diễn ra"
                      ? "bg-success/20 text-success"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {event.status}
                </span>
              </div>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p className="flex items-center">
                  <CalendarOutlined className="mr-2" />
                  {event.date} - {event.time}
                </p>
                <p className="flex items-center">
                  <EnvironmentOutlined className="mr-2" />
                  {event.location}
                </p>
                <p className="flex items-center">
                  <TagOutlined className="mr-2" />
                  {event.type}
                </p>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                {event.description}
              </p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleEditEvent(event)}
                  className="btn btn-outline"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="btn btn-danger"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
