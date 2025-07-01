import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Input,
  Select,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  message,
  Descriptions,
  Form,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import medicalEventApi from "../../api/medicalEventApi";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AccidentManagement() {
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAccident, setSelectedAccident] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  // Modal tạo mới sự cố y tế
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);

  // Map API status từ backend sang frontend format
  const getStatusFromBackend = (backendStatus) => {
    switch (backendStatus) {
      case "Chờ xử lý":
        return "pending";
      case "Đang xử lý":
        return "processing";
      case "Đã xử lý":
      case "Đã hoàn thành":
        return "completed";
      case "Đã chuyển viện":
        return "transferred";
      default:
        return "pending";
    }
  };

  // Map API -> UI
  function mapAccidentData(item) {
    return {
      id: item.medicalEventID ?? item.id ?? "",
      key: item.medicalEventID ?? item.id ?? "",
      submissionCode: item.medicalEventID ?? item.id ?? "",
      studentId: item.studentID ?? "",
      studentName:
        item.studentName ||
        (item.student && item.student.name) ||
        "Chưa có tên",
      studentClass:
        item.className ||
        (item.student && item.student.className) ||
        "Chưa có lớp",
      date: item.eventDateTime ? item.eventDateTime.split("T")[0] : "",
      time: item.eventDateTime
        ? item.eventDateTime.split("T")[1]?.slice(0, 5)
        : "",
      location: item.location || "Chưa rõ",
      type:
        item.eventTypeName ||
        item.eventTypeID ||
        (item.eventType && item.eventType.name) ||
        "Chưa rõ",
      severity: item.severity || "Chưa rõ",
      description: item.description || "",
      status: getStatusFromBackend(item.status),
      handledBy:
        item.nurseName ||
        item.nurseID ||
        (item.nurse && item.nurse.name) ||
        "Chưa rõ",
      treatment: item.actionTaken || "",
      followUp: item.notes || "",
      submissionDate: item.eventDateTime || "",
    };
  }

  // Lấy toàn
  const fetchAllAccidents = async () => {
    setLoading(true);
    try {
      const response = await medicalEventApi.nurse.getAll();
      const mappedData = response.data.map(mapAccidentData);
      setAccidents(mappedData);
    } catch (error) {
      setAccidents([]);
      message.error("Không thể tải danh sách sự cố. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAccidents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter
  const filteredAccidents = accidents.filter((item) => {
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesClass =
      classFilter === "all" || item.studentClass === classFilter;
    const matchesSearch =
      searchText === "" ||
      item.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.studentClass.toLowerCase().includes(searchText.toLowerCase()) ||
      item.studentId.includes(searchText);
    return matchesStatus && matchesClass && matchesSearch;
  });

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang xử lý";
      case "completed":
        return "Đã xử lý";
      case "transferred":
        return "Đã chuyển viện";
      default:
        return status;
    }
  };

  const classes = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B"];
  const statuses = ["pending", "processing", "completed", "transferred"];

  // Table columns
  const columns = [
    {
      title: "Mã sự cố",
      dataIndex: "submissionCode",
      key: "submissionCode",
      width: 90,
      render: (text) => (
        <Text strong style={{ color: "#1890ff", fontSize: "12px" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Học sinh",
      key: "student",
      width: 180,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: "14px" }}>
            {record.studentName}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.studentId} - {record.studentClass}
          </Text>
        </div>
      ),
    },
    {
      title: "Sự cố & Mức độ",
      key: "incident",
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: "13px", color: "#722ed1" }}>
            {record.type}
          </Text>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "submissionDate",
      key: "submissionDate",
      width: 100,
      render: (date) => (
        <div style={{ fontSize: "12px" }}>
          <div>{date ? date.split("T")[0] : ""}</div>
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {date ? date.split("T")[1]?.slice(0, 5) : ""}
          </Text>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
            style={{ padding: "0 4px", fontSize: "12px" }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  // Modal chi tiết tích hợp trong file
  const handleViewDetails = (accident) => {
    setSelectedAccident(accident);
    setDetailModalVisible(true);
  };

  // Lấy danh sách lớp từ dữ liệu
  // const classList = Array.from(
  //   new Set(accidents.map((a) => a.studentClass))
  // ).filter(Boolean);

  // Xử lý tạo mới sự cố y tế
  const handleCreateAccident = async (values) => {
    setCreateLoading(true);
    try {
      const createData = {
        Description: values.description?.trim() || "Không có",
        ActionTaken: values.actionTaken?.trim() || "Không có",
        Notes: values.notes?.trim() || "Không có",
        EventType: values.eventType?.trim() || "Không có",
        StudentID: [values.studentID],
        Image: values.image || [],
      };

      console.log(
        "🚀 Data gửi lên API (sẽ được convert thành FormData):",
        createData
      );

      await medicalEventApi.nurse.create(createData);
      message.success("Tạo sự kiện thành công!");
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchAllAccidents();
    } catch (err) {
      console.error("❌ Lỗi tạo sự cố:", err);

      // Hiển thị thông báo lỗi chi tiết từ backend
      if (err?.response?.data?.message) {
        message.error(`Lỗi: ${err.response.data.message}`);
      } else if (err?.response?.data?.errors) {
        // Nếu backend trả về validation errors
        const errorMessages = Object.values(err.response.data.errors).flat();
        message.error(`Lỗi validation: ${errorMessages.join(", ")}`);
      } else {
        message.error("Có lỗi xảy ra khi tạo sự cố. Vui lòng thử lại!");
      }
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
        minHeight: "100vh",
        padding: "0",
      }}
    >
      {/* 🎨 Modern Enhanced Header with Navigation Feel */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
          borderRadius: "0 0 32px 32px",
          padding: "40px 32px 48px",
          marginBottom: "40px",
          boxShadow:
            "0 25px 50px rgba(79, 70, 229, 0.25), 0 0 0 1px rgba(255,255,255,0.1)",
          position: "relative",
          overflow: "hidden",
          border: "none",
        }}
      >
        {/* Enhanced Background decorations */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)",
            borderRadius: "50%",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "250px",
            height: "250px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />

        {/* Header Content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <Row align="middle" justify="space-between">
            <Col xs={24} md={16}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "24px" }}
              >
                {/* Logo/Icon Section */}
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #ff6b9d 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "0 15px 35px rgba(255, 107, 107, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)",
                    border: "2px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "36px",
                      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))",
                    }}
                  >
                    🚨
                  </span>
                </div>

                {/* Title Section */}
                <div>
                  <Title
                    level={1}
                    style={{
                      color: "white",
                      marginBottom: "8px",
                      fontSize: "36px",
                      fontWeight: "800",
                      textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
                      letterSpacing: "0.5px",
                      lineHeight: "1.2",
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Quản Lý Sự Cố Y Tế
                  </Title>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#10b981",
                        boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.3)",
                      }}
                    />
                    <Text
                      style={{
                        fontSize: "16px",
                        color: "rgba(255,255,255,0.95)",
                        fontWeight: "500",
                        textShadow: "1px 1px 3px rgba(0,0,0,0.2)",
                      }}
                    >
                      Hệ thống theo dõi và xử lý sự cố y tế cho học sinh tiểu
                      học
                    </Text>
                  </div>
                </div>
              </div>
            </Col>

            <Col
              xs={24}
              md={8}
              style={{ textAlign: "right", marginTop: { xs: "24px", md: "0" } }}
            >
              {/* Quick Stats in Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "16px",
                    padding: "12px 16px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    textAlign: "center",
                    minWidth: "100px",
                  }}
                >
                  <div style={{ fontSize: "18px", marginBottom: "4px" }}>
                    📊
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "white",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                    }}
                  >
                    {accidents.length}
                  </div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.9)",
                      fontWeight: "500",
                    }}
                  >
                    Tổng sự cố
                  </Text>
                </div>
                {/* Box thống kê thứ 2 */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "16px",
                    padding: "12px 16px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    textAlign: "center",
                    minWidth: "100px",
                  }}
                >
                  <div style={{ fontSize: "18px", marginBottom: "4px" }}>
                    ⏱️
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.9)",
                      fontWeight: "500",
                    }}
                  >
                    {new Date().toLocaleDateString("vi-VN")}
                  </div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.8)",
                      fontWeight: "400",
                    }}
                  >
                    Hôm nay
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Main Content Container */}
      <div style={{ padding: "0 32px 32px" }}>
        {/* 📊 Thống kê trạng thái sự cố */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <Text style={{ color: "white", fontSize: "24px" }}>🚨</Text>
              </div>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "20px",
                    background:
                      "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Thống kê trạng thái sự cố
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  Tổng quan về các sự cố theo trạng thái xử lý
                </Text>
              </div>
            </div>
          }
          style={{
            marginBottom: "32px",
            borderRadius: "20px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08), 0 1px 8px rgba(0,0,0,0.02)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                  border: "2px solid rgba(251, 191, 36, 0.2)",
                  boxShadow: "0 8px 25px rgba(251, 191, 36, 0.15)",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
                <Text
                  strong
                  style={{
                    fontSize: "18px",
                    color: "#92400e",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Chờ xử lý
                </Text>
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#b45309",
                  }}
                >
                  {accidents.filter((a) => a.status === "pending").length}
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                  border: "2px solid rgba(59, 130, 246, 0.2)",
                  boxShadow: "0 8px 25px rgba(59, 130, 246, 0.15)",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔄</div>
                <Text
                  strong
                  style={{
                    fontSize: "18px",
                    color: "#1e40af",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Đang xử lý
                </Text>
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#2563eb",
                  }}
                >
                  {accidents.filter((a) => a.status === "processing").length}
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                  border: "2px solid rgba(34, 197, 94, 0.2)",
                  boxShadow: "0 8px 25px rgba(34, 197, 94, 0.15)",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>✅</div>
                <Text
                  strong
                  style={{
                    fontSize: "18px",
                    color: "#166534",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Đã xử lý
                </Text>
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#16a34a",
                  }}
                >
                  {accidents.filter((a) => a.status === "completed").length}
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                  border: "2px solid rgba(239, 68, 68, 0.2)",
                  boxShadow: "0 8px 25px rgba(239, 68, 68, 0.15)",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🏥</div>
                <Text
                  strong
                  style={{
                    fontSize: "18px",
                    color: "#991b1b",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Đã chuyển viện
                </Text>
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#dc2626",
                  }}
                >
                  {accidents.filter((a) => a.status === "transferred").length}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 🔍 Bộ lọc và tìm kiếm */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <Text style={{ color: "white", fontSize: "24px" }}>🔍</Text>
              </div>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "18px",
                    background:
                      "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Bộ lọc và tìm kiếm
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  Lọc theo trạng thái, lớp học và tìm kiếm theo mã học sinh
                </Text>
              </div>
            </div>
          }
          style={{
            marginBottom: "32px",
            borderRadius: "20px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08), 0 1px 8px rgba(0,0,0,0.02)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={4}>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Trạng thái
                </Text>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: "100%" }}
                  size="large"
                  suffixIcon={<CaretDownOutlined />}
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  {statuses.map((status) => (
                    <Option key={status} value={status}>
                      {getStatusText(status)}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            <Col xs={24} sm={8} md={4}>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Lớp
                </Text>
                <Select
                  value={classFilter}
                  onChange={setClassFilter}
                  style={{ width: "100%" }}
                  size="large"
                  suffixIcon={<CaretDownOutlined />}
                >
                  <Option value="all">Tất cả lớp</Option>
                  {classes.map((cls) => (
                    <Option key={cls} value={cls}>
                      Lớp {cls}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            <Col xs={24} sm={8} md={6}>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Tìm kiếm theo mã học sinh
                </Text>
                <Input.Search
                  placeholder="Nhập mã học sinh, tên, lớp..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                  style={{ width: "100%" }}
                />
              </div>
            </Col>

            <Col xs={24} sm={24} md={10} style={{ textAlign: "right" }}>
              <div style={{ marginTop: { xs: "0", md: "30px" } }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  style={{
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "none",
                    borderRadius: "12px",
                    height: "48px",
                    padding: "0 24px",
                    fontWeight: "600",
                    boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
                  }}
                  onClick={() => setCreateModalVisible(true)}
                >
                  Thêm sự cố mới
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 📋 Bảng danh sách sự cố */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <Text style={{ color: "white", fontSize: "24px" }}>📋</Text>
              </div>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "18px",
                    background:
                      "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Danh sách sự cố y tế
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  Quản lý và theo dõi tất cả sự cố y tế
                </Text>
              </div>
            </div>
          }
          style={{
            borderRadius: "20px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08), 0 1px 8px rgba(0,0,0,0.02)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          <Table
            columns={columns}
            dataSource={filteredAccidents}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} sự cố`,
            }}
            bordered
            size="middle"
            style={{
              borderRadius: "12px",
              overflow: "hidden",
            }}
          />
        </Card>

        {/* Modal chi tiết tích hợp trong file */}
        <Modal
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
                }}
              >
                <span style={{ fontSize: "20px" }}>🚨</span>
              </div>
              <Text strong style={{ fontSize: "18px" }}>
                Chi tiết sự cố y tế
              </Text>
            </div>
          }
          width={700}
          style={{
            borderRadius: "20px",
          }}
        >
          {selectedAccident && (
            <Descriptions
              column={2}
              bordered
              size="middle"
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <Descriptions.Item label="Mã sự cố" span={1}>
                <Text strong style={{ color: "#1890ff" }}>
                  {selectedAccident.submissionCode}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Học sinh" span={1}>
                <Text strong>{selectedAccident.studentName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Lớp" span={1}>
                <Text>{selectedAccident.studentClass}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã học sinh" span={1}>
                <Text>{selectedAccident.studentId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian" span={1}>
                <Text>
                  {selectedAccident.date} {selectedAccident.time}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại sự cố" span={1}>
                <Text strong style={{ color: "#722ed1" }}>
                  {selectedAccident.type}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ" span={1}>
                <Text>{selectedAccident.severity}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Người xử lý" span={1}>
                <Text>{selectedAccident.handledBy}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm" span={1}>
                <Text>{selectedAccident.location}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                <Text>{selectedAccident.description || "Chưa có mô tả"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Xử lý" span={2}>
                <Text>
                  {selectedAccident.treatment || "Chưa có thông tin xử lý"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Theo dõi" span={2}>
                <Text></Text>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        {/* Modal tạo mới sự cố y tế */}
        <Modal
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                }}
              >
                <span style={{ fontSize: "20px" }}>🚨</span>
              </div>
              <Text strong style={{ fontSize: "18px" }}>
                Thêm sự cố y tế mới
              </Text>
            </div>
          }
          width={600}
          style={{ borderRadius: "20px" }}
          footer={null}
          destroyOnHidden
        >
          <Form
            form={createForm}
            layout="vertical"
            onFinish={handleCreateAccident}
            autoComplete="off"
          >
            <Form.Item
              label="Mã học sinh"
              name="studentID"
              rules={[
                { required: true, message: "Vui lòng nhập mã học sinh!" },
              ]}
            >
              <Input placeholder="Nhập mã học sinh" size="large" />
            </Form.Item>
            <Form.Item
              label="Loại sự cố"
              name="eventType"
              rules={[{ required: true, message: "Vui lòng nhập loại sự cố!" }]}
            >
              <Input
                placeholder="Nhập loại sự cố (ví dụ: đau, ngã, sốt...)"
                size="large"
              />
            </Form.Item>
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea placeholder="Mô tả chi tiết sự cố" rows={3} />
            </Form.Item>
            <Form.Item label="Xử lý ban đầu" name="actionTaken">
              <Input.TextArea
                placeholder="Các biện pháp xử lý ban đầu"
                rows={2}
              />
            </Form.Item>
            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea placeholder="Ghi chú thêm (nếu có)" rows={2} />
            </Form.Item>
            <Form.Item
              label="Hình ảnh"
              name="image"
              valuePropName="fileList"
              getValueFromEvent={(e) =>
                Array.isArray(e) ? e : e && e.fileList
              }
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                accept="image/*"
                listType="picture"
              >
                <Button>Chọn ảnh</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={createLoading}
                style={{
                  width: "100%",
                  height: 44,
                  fontWeight: 600,
                  borderRadius: 10,
                }}
              >
                Tạo mới sự cố
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
