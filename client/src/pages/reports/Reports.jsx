
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Row,
  Col,
  Typography,
  Select,
  DatePicker,
  Space,
  Statistic,
  Progress,
  Tag,
  Divider,
  message,
} from "antd";
import {
  BarChartOutlined,
  FileTextOutlined,
  DownloadOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("health-summary");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(1, "month"),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(false);

  // Mock data for reports
  const healthSummaryData = [
    {
      key: "1",
      period: "Tháng 1/2025",
      totalCheckups: 245,
      vaccinations: 89,
      accidents: 12,
      medicineDispensed: 156,
    },
    {
      key: "2",
      period: "Tháng 2/2025",
      totalCheckups: 278,
      vaccinations: 124,
      accidents: 8,
      medicineDispensed: 203,
    },
    {
      key: "3",
      period: "Tháng 3/2025",
      totalCheckups: 298,
      vaccinations: 156,
      accidents: 15,
      medicineDispensed: 189,
    },
  ];

  const medicineReportData = [
    {
      key: "1",
      medicineName: "Paracetamol 500mg",
      totalDispensed: 45,
      remainingStock: 155,
      expiryDate: "2025-12-31",
      status: "Đủ",
    },
    {
      key: "2",
      medicineName: "Amoxicillin 250mg",
      totalDispensed: 23,
      remainingStock: 12,
      expiryDate: "2025-08-15",
      status: "Thiếu",
    },
    {
      key: "3",
      medicineName: "Vitamin C",
      totalDispensed: 67,
      remainingStock: 89,
      expiryDate: "2026-06-30",
      status: "Đủ",
    },
  ];

  const healthSummaryColumns = [
    {
      title: "Thời gian",
      dataIndex: "period",
      key: "period",
    },
    {
      title: "Tổng khám sức khỏe",
      dataIndex: "totalCheckups",
      key: "totalCheckups",
      align: "center",
    },
    {
      title: "Tiêm chủng",
      dataIndex: "vaccinations",
      key: "vaccinations",
      align: "center",
    },
    {
      title: "Tai nạn",
      dataIndex: "accidents",
      key: "accidents",
      align: "center",
    },
    {
      title: "Thuốc cấp phát",
      dataIndex: "medicineDispensed",
      key: "medicineDispensed",
      align: "center",
    },
  ];

  const medicineColumns = [
    {
      title: "Tên thuốc",
      dataIndex: "medicineName",
      key: "medicineName",
    },
    {
      title: "Đã cấp phát",
      dataIndex: "totalDispensed",
      key: "totalDispensed",
      align: "center",
    },
    {
      title: "Tồn kho",
      dataIndex: "remainingStock",
      key: "remainingStock",
      align: "center",
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Đủ" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  const reportTypes = [
    {
      value: "health-summary",
      label: "Báo cáo tổng hợp sức khỏe",
      icon: <HeartOutlined />,
    },
    {
      value: "medicine-report",
      label: "Báo cáo thuốc",
      icon: <MedicineBoxOutlined />,
    },
    {
      value: "vaccination-report",
      label: "Báo cáo tiêm chủng",
      icon: <CalendarOutlined />,
    },
    {
      value: "accident-report",
      label: "Báo cáo tai nạn",
      icon: <ExclamationCircleOutlined />,
    },
  ];
  const handleExport = async () => {
    setLoading(true);
    try {
      // Mock export functionality - in real implementation, call API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock file download
      const reportData = getCurrentReportData();
      const fileName = `${getReportFileName()}_${dayjs().format(
        "YYYYMMDD"
      )}.xlsx`;

      // Mock download - in real implementation, create and download actual file
      const mockFileContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([mockFileContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success("Xuất báo cáo thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi xuất báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentReportData = () => {
    switch (selectedReport) {
      case "health-summary":
        return healthSummaryData;
      case "medicine-report":
        return medicineReportData;
      default:
        return [];
    }
  };

  const getReportFileName = () => {
    const reportNames = {
      "health-summary": "BaoCaoTongQuanSucKhoe",
      "medicine-report": "BaoCaoThuoc",
      "vaccination-report": "BaoCaoTiemChung",
      "accident-report": "BaoCaoTaiNan",
    };
    return reportNames[selectedReport] || "BaoCao";
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case "health-summary":
        return (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tổng khám sức khỏe"
                    value={821}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tiêm chủng"
                    value={369}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tai nạn"
                    value={35}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Thuốc cấp phát"
                    value={548}
                    prefix={<MedicineBoxOutlined />}
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Card>
              </Col>
            </Row>
            <Table
              columns={healthSummaryColumns}
              dataSource={healthSummaryData}
              pagination={false}
            />
          </>
        );

      case "medicine-report":
        return (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Tổng loại thuốc"
                    value={45}
                    prefix={<MedicineBoxOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Thuốc sắp hết"
                    value={3}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <div>
                    <Text strong>Tỷ lệ sử dụng thuốc</Text>
                    <div style={{ marginTop: 8 }}>
                      <Progress percent={73} strokeColor="#52c41a" />
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
            <Table
              columns={medicineColumns}
              dataSource={medicineReportData}
              pagination={false}
            />
          </>
        );

      case "vaccination-report":
        return (
          <Card>
            <Title level={4}>Báo cáo tiêm chủng</Title>
            <Text>Chức năng đang được phát triển...</Text>
          </Card>
        );

      case "accident-report":
        return (
          <Card>
            <Title level={4}>Báo cáo tai nạn</Title>
            <Text>Chức năng đang được phát triển...</Text>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <BarChartOutlined style={{ marginRight: 8 }} />
            Báo cáo & Thống kê
          </Title>
          <Text type="secondary">
            Xem và xuất báo cáo chi tiết về hoạt động y tế trường học
          </Text>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Space>
                <Text strong>Loại báo cáo:</Text>
                <Select
                  value={selectedReport}
                  onChange={setSelectedReport}
                  style={{ width: 200 }}
                >
                  {reportTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      <Space>
                        {type.icon}
                        {type.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <Space>
                <Text strong>Thời gian:</Text>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  format="DD/MM/YYYY"
                />
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: "right" }}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  loading={loading}
                  onClick={handleExport}
                >
                  Xuất báo cáo
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        <motion.div
          key={selectedReport}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>{renderReportContent()}</Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Reports;
