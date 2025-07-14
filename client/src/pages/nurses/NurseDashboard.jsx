/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Typography,
  Badge,
  Progress,
  Space,
  Button,
  Modal,
  Checkbox,
  Select,
  DatePicker,
  message,
  Dropdown,
  Divider,
  Table,
  Tag,
} from "antd";
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  TeamOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  DownloadOutlined,
  DragOutlined,
  EyeOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import authService from "../../services/authService";
import reportApi from "../../api/reportApi";
import { Pie } from "@ant-design/plots";
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

function NurseDashboard() {
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser ? currentUser.role : "USER";

  // State for report data from API
  const [reportData, setReportData] = useState({
    totalHealthCheckUp: 0,
    confirmHealthCheckUp: 0,
    deniedHealthCheckUp: 0,
    notResponseHealthCheckUp: 0,
    countActiveNews: 0,
    totalMedicalEvent: 0,
    countInActiveNews: 0,
    emergencyCount: 0,
    accidentCount: 0,
    illnessCount: 0,
    otherCount: 0,
    injuryCount: 0,
  });
  const [reportLoading, setReportLoading] = useState(false);

  // Lấy dữ liệu báo cáo từ API khi load trang
  useEffect(() => {
    async function fetchReport() {
      setReportLoading(true);
      try {
        const now = new Date();
        const toDate = now.toISOString();
        const fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const res = await reportApi.generateReport(fromDate, toDate);
        const apiData = res && res.data && res.data.data ? res.data.data : res.data;
        setReportData({
          totalHealthCheckUp: apiData?.totalHealthCheckUp ?? 0,
          confirmHealthCheckUp: apiData?.confirmHealthCheckUp ?? 0,
          deniedHealthCheckUp: apiData?.deniedHealthCheckUp ?? 0,
          notResponseHealthCheckUp: apiData?.notResponseHealthCheckUp ?? 0,
          countActiveNews: apiData?.countActiveNews ?? 0,
          totalMedicalEvent: apiData?.totalMedicalEvent ?? 0,
          countInActiveNews: apiData?.countInActiveNews ?? 0,
          emergencyCount: apiData?.emergencyCount ?? 0,
          accidentCount: apiData?.accidentCount ?? 0,
          illnessCount: apiData?.illnessCount ?? 0,
          otherCount: apiData?.otherCount ?? 0,
          injuryCount: apiData?.injuryCount ?? 0,
        });
      } catch {
        message.error("Không thể tải dữ liệu báo cáo dashboard!");
        setReportData({
          totalHealthCheckUp: 0,
          confirmHealthCheckUp: 0,
          deniedHealthCheckUp: 0,
          notResponseHealthCheckUp: 0,
          countActiveNews: 0,
          totalMedicalEvent: 0,
          countInActiveNews: 0,
          emergencyCount: 0,
          accidentCount: 0,
          illnessCount: 0,
          otherCount: 0,
          injuryCount: 0,
        });
      } finally {
        setReportLoading(false);
      }
    }
    fetchReport();
    // eslint-disable-next-line
  }, []);

  // Widget chỉ giữ lại thống kê tổng quan
  const renderStatisticsWidget = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card hoverable loading={reportLoading}>
          <Statistic
            title="Tổng khám sức khỏe"
            value={reportData.totalHealthCheckUp}
            prefix={<CheckCircleOutlined style={{ color: "#0F6CBD" }} />}
            valueStyle={{ color: "#0F6CBD" }}
          />
          <Space size="small" style={{ marginTop: 8, flexWrap: "wrap" }}>
            <Tag color="blue">Xác nhận: {reportData.confirmHealthCheckUp}</Tag>
            <Tag color="red">Từ chối: {reportData.deniedHealthCheckUp}</Tag>
            <Tag color="orange">Chưa phản hồi: {reportData.notResponseHealthCheckUp}</Tag>
          </Space>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card hoverable loading={reportLoading}>
          <Statistic
            title="Tin tức hoạt động"
            value={reportData.countActiveNews}
            prefix={<SafetyCertificateOutlined style={{ color: "#52c41a" }} />}
            valueStyle={{ color: "#52c41a" }}
          />
          <Tag color="green" style={{ marginTop: 8, display: "inline-block" }}>
            Sự kiện y tế: {reportData.totalMedicalEvent}
          </Tag>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card hoverable loading={reportLoading}>
          <Statistic
            title="Tin tức đã ẩn"
            value={reportData.countInActiveNews}
            prefix={<AlertOutlined style={{ color: "#ff4d4f" }} />}
            valueStyle={{ color: "#ff4d4f" }}
          />
          <Space size="small" style={{ marginTop: 8, flexWrap: "wrap" }}>
            <Tag color="red">Cấp cứu: {reportData.emergencyCount}</Tag>
            <Tag color="orange">Tai nạn: {reportData.accidentCount}</Tag>
            <Tag color="purple">Bệnh: {reportData.illnessCount}</Tag>
            <Tag color="default">Khác: {reportData.otherCount}</Tag>
            <Tag color="magenta">Chấn thương: {reportData.injuryCount}</Tag>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // Pie chart cấu hình cho sự kiện y tế
  const medicalEventPieData = [
    { type: "Cấp cứu", value: reportData.emergencyCount },
    { type: "Tai nạn", value: reportData.accidentCount },
    { type: "Bệnh", value: reportData.illnessCount },
    { type: "Chấn thương", value: reportData.injuryCount },
    { type: "Khác", value: reportData.otherCount },
  ].filter(item => item.value > 0);

  const pieConfig = {
    appendPadding: 10,
    data: medicalEventPieData,
    angleField: "value",
    colorField: "type",
    radius: 0.9,
    label: {
      type: "outer",
      content: "{name} ({percentage})",
    },
    legend: { position: "bottom" },
    tooltip: { showTitle: false, showMarkers: false },
  };

  // Bar chart cấu hình cho khám sức khỏe
  const healthCheckBarData = [
    { type: "Xác nhận", value: reportData.confirmHealthCheckUp },
    { type: "Từ chối", value: reportData.deniedHealthCheckUp },
    { type: "Chưa phản hồi", value: reportData.notResponseHealthCheckUp },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: "24px" }}
    >
      {/* Header with Dashboard Controls */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ marginBottom: 0, color: "#0F6CBD" }}>
          Tổng quan hệ thống {userRole === "MANAGER" ? "Quản lý" : "Y tế"}
        </Title>
      </div>
      <div style={{ marginBottom: "24px" }}>{renderStatisticsWidget()}</div>

      {/* Biểu đồ tổng quan */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Tỉ lệ loại sự kiện y tế" bordered={false}>
            {medicalEventPieData.length > 0 ? (
              <Pie {...pieConfig} />
            ) : (
              <div className="text-center text-gray-400 py-8">Không có dữ liệu sự kiện y tế</div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Tỉ lệ xác nhận khám sức khỏe" bordered={false}>
            <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Pie
                data={healthCheckBarData}
                angleField="value"
                colorField="type"
                radius={0.9}
                label={{
                  type: "outer",
                  content: "{name} ({percentage})",
                }}
                legend={{ position: "bottom" }}
                tooltip={{ showTitle: false, showMarkers: false }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
}

export default NurseDashboard;
