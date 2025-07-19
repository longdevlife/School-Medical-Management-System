import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Space,
  Typography,
  Row,
  Col,
  message,
  Descriptions,
  Input,
  Select,
  Tag,
} from "antd";
import {
  EyeOutlined,
  HeartOutlined,
  UserOutlined,
  ProfileOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import healthProfileApi from "../../api/healthProfileApi";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const { Title, Text } = Typography;
const { Option } = Select;

function HealthProfileView() {
  const [healthProfiles, setHealthProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [classFilter, setClassFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [healthFilter, setHealthFilter] = useState("all"); // 🆕 Filter by health status

  // List of classes for filter
  const classes = ["1A", "2A", "3A", "4A", "5A"];

  // API fetch data từ health profile endpoint
  const fetchHealthProfiles = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching health profiles...");
      const response = await healthProfileApi.nurse.getAll();
      console.log("✅ Health Profile API response:", response.data);

      // Map dữ liệu từ API health profile
      const mappedData = response.data.map((item) => {
        return {
          id: item.healthProfileID,
          key: item.healthProfileID,
          studentId: item.studentID,
          studentName: item.studentName || "Chưa có tên",
          studentClass: item.class || "Chưa có lớp",
          healthProfileID: item.healthProfileID,

          // Thông tin sức khỏe
          allergyHistory: item.allergyHistory || "Không",
          chronicDiseases: item.chronicDiseases || "Không",
          pastSurgeries: item.pastSurgeries || 0,
          surgicalCause: item.surgicalCause || "Không",
          disabilities: item.disabilities || "Không",

          // Thông số cơ thể
          height: item.height || 0,
          weight: item.weight || 0,

          // Thị lực
          visionLeft: item.visionLeft || 10,
          visionRight: item.visionRight || 10,

          // Răng miệng
          toothDecay: item.toothDecay || "Không",

          // Vấn đề sức khỏe khác
          otherHealthIssues: item.otheHealthIssues || "Không",

          // UI display fields
          createdDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
      });

      console.log("✅ Mapped health profile data:", mappedData);
      setHealthProfiles(mappedData);
    } catch (error) {
      console.error("❌ Lỗi fetch health profile API:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 403) {
        message.error("Bạn không có quyền truy cập chức năng này.");
      } else if (error.response?.status === 404) {
        message.error("Không tìm thấy dữ liệu hồ sơ sức khỏe.");
      } else {
        message.error(
          "Không thể tải danh sách hồ sơ sức khỏe. Vui lòng thử lại sau."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (profile) => {
    setSelectedProfile(profile);
    setDetailModalVisible(true);
  };

  // Handle search function
  const handleSearch = () => {
    console.log("🔍 Searching for:", searchText);
    console.log("🔍 Class filter:", classFilter);
    console.log("🔍 Health filter:", healthFilter);
  };

  // Enhanced filter logic for health profiles
  const filteredProfiles = healthProfiles.filter((profile) => {
    const matchesClass =
      classFilter === "all" || profile.studentClass === classFilter;

    // Health status filter
    const matchesHealth = (() => {
      switch (healthFilter) {
        case "allergy":
          return profile.allergyHistory !== "Không";
        case "chronic":
          return profile.chronicDiseases !== "Không";
        case "tooth":
          return profile.toothDecay !== "Không";
        case "normal":
          return (
            profile.allergyHistory === "Không" &&
            profile.chronicDiseases === "Không" &&
            profile.toothDecay === "Không"
          );
        default:
          return true;
      }
    })();

    // Multi-field search: studentId, studentName, studentClass - Safe string conversion
    const search = searchText.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (profile.studentId &&
        String(profile.studentId).toLowerCase().includes(search)) ||
      (profile.studentName &&
        String(profile.studentName).toLowerCase().includes(search)) ||
      (profile.studentClass &&
        String(profile.studentClass).toLowerCase().includes(search));

    return matchesClass && matchesHealth && matchesSearch;
  });

  // Columns configuration for health profile table
  const columns = [
    {
      title: "Mã hồ sơ",
      dataIndex: "healthProfileID",
      key: "healthProfileID",
      width: 120,
      render: (text) => (
        <Text strong style={{ color: "#1890ff", fontSize: "12px" }}>
          HS-{text}
        </Text>
      ),
    },
    {
      title: "Thông tin học sinh",
      key: "student",
      width: 200,
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
      title: "Thông số cơ thể",
      key: "bodyStats",
      width: 150,
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: "13px" }}>
            📏 Chiều cao: {record.height}cm
          </Text>
          <br />
          <Text style={{ fontSize: "13px" }}>
            ⚖️ Cân nặng: {record.weight}kg
          </Text>
        </div>
      ),
    },
    {
      title: "Tình trạng sức khỏe",
      key: "healthStatus",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: "4px" }}>
            <Tag
              color={record.allergyHistory !== "Không" ? "orange" : "green"}
              size="small"
            >
              🤧 Dị ứng: {record.allergyHistory}
            </Tag>
          </div>
          <div>
            <Tag
              color={record.chronicDiseases !== "Không" ? "red" : "green"}
              size="small"
            >
              🏥 Bệnh mạn tính: {record.chronicDiseases}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Thị lực",
      key: "vision",
      width: 120,
      render: (_, record) => (
        <div style={{ fontSize: "12px" }}>
          <div>👁️ Trái: {record.visionLeft}/10</div>
          <div>👁️ Phải: {record.visionRight}/10</div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
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

  // Setup auto refresh - tự động refresh mỗi 30 giây
  useAutoRefresh(fetchHealthProfiles, 10000);

  useEffect(() => {
    fetchHealthProfiles();
  }, []);

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
        minHeight: "100vh",
        padding: "0",
      }}
    >
      {/* Enhanced Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)",
          borderRadius: "0 0 32px 32px",
          padding: "40px 32px 48px",
          marginBottom: "40px",
          boxShadow:
            "0 25px 50px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(255,255,255,0.1)",
          position: "relative",
          overflow: "hidden",
          border: "none",
        }}
      >
        {/* Background decorations */}
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
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          <Row align="middle" justify="space-between">
            <Col xs={24} md={16}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "24px" }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "0 15px 35px rgba(6, 182, 212, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)",
                    border: "2px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "36px",
                      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))",
                    }}
                  >
                    🏥
                  </span>
                </div>

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
                    Hồ sơ sức khỏe học sinh
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
                        background: "#34d399",
                        boxShadow: "0 0 0 4px rgba(52, 211, 153, 0.3)",
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
                      Hệ thống quản lý và theo dõi tình trạng sức khỏe học sinh
                    </Text>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} md={8} style={{ textAlign: "right" }}>
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
                    👥
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "white",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                    }}
                  >
                    {healthProfiles.length}
                  </div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.9)",
                      fontWeight: "500",
                    }}
                  >
                    Hồ sơ
                  </Text>
                </div>
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

      {/* Main Content */}
      <div style={{ padding: "0 32px 32px" }}>
        {/* 📊 Thống kê hồ sơ sức khỏe */}
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
                <Text style={{ color: "white", fontSize: "24px" }}>📊</Text>
              </div>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "18px",
                    color: "#1e293b",
                    display: "flex",
                    marginBottom: "4px",
                  }}
                >
                  Thống kê hồ sơ sức khỏe
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    fontWeight: "400",
                  }}
                >
                  Tổng quan về tình trạng sức khỏe học sinh theo lớp
                </Text>
              </div>
            </div>
          }
          style={{
            marginBottom: "32px",
            borderRadius: "20px",
            border: "none",
            background: "white",
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
          }}
          bodyStyle={{ padding: "32px" }}
        >
          <Row gutter={[20, 20]} justify="center">
            <Col xs={12} sm={6} md={4}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "20px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(59, 130, 246, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(59, 130, 246, 0.2)";
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "40px",
                      marginBottom: "12px",
                      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))",
                    }}
                  >
                    📋
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#2563eb",
                      marginBottom: "6px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {healthProfiles.length}
                  </div>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: "#1e40af",
                      fontWeight: "600",
                    }}
                  >
                    Tổng hồ sơ
                  </Text>
                </div>
              </Card>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  boxShadow: "0 10px 25px rgba(245, 158, 11, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "20px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(245, 158, 11, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(245, 158, 11, 0.2)";
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "40px",
                      marginBottom: "12px",
                      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))",
                    }}
                  >
                    🤧
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#d97706",
                      marginBottom: "6px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {
                      healthProfiles.filter((p) => p.allergyHistory !== "Không")
                        .length
                    }
                  </div>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: "#92400e",
                      fontWeight: "600",
                    }}
                  >
                    Có dị ứng
                  </Text>
                </div>
              </Card>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  boxShadow: "0 10px 25px rgba(239, 68, 68, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "20px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(239, 68, 68, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(239, 68, 68, 0.2)";
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "40px",
                      marginBottom: "12px",
                      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))",
                    }}
                  >
                    🏥
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#ef4444",
                      marginBottom: "6px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {
                      healthProfiles.filter(
                        (p) => p.chronicDiseases !== "Không"
                      ).length
                    }
                  </div>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: "#dc2626",
                      fontWeight: "600",
                    }}
                  >
                    Bệnh mạn tính
                  </Text>
                </div>
              </Card>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  boxShadow: "0 10px 25px rgba(147, 51, 234, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "20px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(147, 51, 234, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(147, 51, 234, 0.2)";
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "40px",
                      marginBottom: "12px",
                      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))",
                    }}
                  >
                    🦷
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#9333ea",
                      marginBottom: "6px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {
                      healthProfiles.filter((p) => p.toothDecay !== "Không")
                        .length
                    }
                  </div>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: "#7c3aed",
                      fontWeight: "600",
                    }}
                  >
                    Sâu răng
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 🎯 Bộ lọc và tìm kiếm */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(59, 130, 246, 0.18)",
                  border: "2px solid rgba(59,130,246,0.12)",
                }}
              >
                <Text style={{ color: "white", fontSize: "24px" }}>🔍</Text>
              </div>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "18px",
                    color: "#1e293b",
                    display: "flex",
                    marginBottom: "4px",
                  }}
                >
                  Bộ lọc và tìm kiếm
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    fontWeight: "400",
                  }}
                >
                  Lọc theo lớp học và tìm kiếm theo mã học sinh, tên học sinh
                </Text>
              </div>
            </div>
          }
          style={{
            marginBottom: "32px",
            borderRadius: "20px",
            border: "none",
            background: "white",
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
          }}
          bodyStyle={{ padding: "0" }}
        >
          <div
            style={{
              background: "#f8fafc",
              padding: "24px 24px 16px 24px",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <Row gutter={[16, 16]} align="middle">
              {/* Lớp học */}
              <Col xs={24} sm={12} md={8} lg={5}>
                <div style={{ marginBottom: "6px" }}>
                  <Text
                    strong
                    style={{
                      fontSize: "13px",
                      color: "#b91c1c",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>🏫</span>{" "}
                    <span>Lớp</span>
                  </Text>
                </div>
                <Select
                  placeholder="Chọn lớp"
                  style={{ width: "100%" }}
                  value={classFilter}
                  onChange={setClassFilter}
                  size="middle"
                >
                  <Option value="all">
                    <span style={{ fontSize: "13px", color: "#666" }}>
                      🎓 Tất cả
                    </span>
                  </Option>
                  {classes.map((cls) => (
                    <Option key={cls} value={cls}>
                      <span style={{ fontSize: "13px" }}>{cls}</span>
                    </Option>
                  ))}
                </Select>
              </Col>

              {/* Tình trạng sức khỏe */}
              <Col xs={24} sm={12} md={8} lg={5}>
                <div style={{ marginBottom: "6px" }}>
                  <Text
                    strong
                    style={{
                      fontSize: "13px",
                      color: "#059669",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>🏥</span>{" "}
                    <span>Tình trạng</span>
                  </Text>
                </div>
                <Select
                  placeholder="Chọn tình trạng"
                  style={{ width: "100%" }}
                  value={healthFilter}
                  onChange={setHealthFilter}
                  size="middle"
                >
                  <Option value="all">
                    <span style={{ fontSize: "13px", color: "#666" }}>
                      📋 Tất cả
                    </span>
                  </Option>
                  <Option value="allergy">
                    <span style={{ fontSize: "13px" }}>🤧 Có dị ứng</span>
                  </Option>
                  <Option value="chronic">
                    <span style={{ fontSize: "13px" }}>🏥 Bệnh mạn tính</span>
                  </Option>
                  <Option value="tooth">
                    <span style={{ fontSize: "13px" }}>🦷 Sâu răng</span>
                  </Option>
                  <Option value="normal">
                    <span style={{ fontSize: "13px" }}>✅ Bình thường</span>
                  </Option>
                </Select>
              </Col>

              {/* Tìm kiếm */}
              <Col xs={24} sm={24} md={8} lg={8}>
                <div style={{ marginBottom: "6px" }}>
                  <Text
                    strong
                    style={{
                      fontSize: "13px",
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>👤</span>{" "}
                    <span>Tìm kiếm</span>
                  </Text>
                </div>
                <Input.Group compact style={{ display: "flex", width: "100%" }}>
                  <Input
                    placeholder="Nhập mã học sinh, tên, lớp..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{
                      flex: 1,
                      borderRadius: "8px 0 0 8px",
                      fontSize: "13px",
                      borderRight: "none",
                      minWidth: 0,
                    }}
                    size="middle"
                  />
                  <Button
                    type="primary"
                    style={{
                      width: "44px",
                      minWidth: "44px",
                      borderRadius: "0 8px 8px 0",
                      background:
                        "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                      borderColor: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
                      transition: "all 0.2s ease",
                    }}
                    size="middle"
                    title="Tìm kiếm"
                    onClick={handleSearch}
                  >
                    <span role="img" aria-label="search">
                      🔍
                    </span>
                  </Button>
                </Input.Group>
              </Col>

              {/* Cập nhật lúc */}
              <Col xs={24} sm={24} md={24} lg={6}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      padding: "14px 20px",
                      background:
                        "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                      borderRadius: "16px",
                      border: "1px solid #bfdbfe",
                      textAlign: "center",
                      boxShadow: "0 3px 8px rgba(59, 130, 246, 0.12)",
                      minWidth: "140px",
                    }}
                  >
                    <div style={{ fontSize: "18px", marginBottom: "4px" }}>
                      🕒
                    </div>
                    <Text
                      style={{
                        color: "#1e40af",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "block",
                      }}
                    >
                      Cập nhật lúc
                    </Text>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        marginTop: "2px",
                        fontWeight: "500",
                      }}
                    >
                      {new Date().toLocaleTimeString("vi-VN")}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Bảng danh sách hồ sơ sức khỏe */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(124, 58, 237, 0.3)",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <ProfileOutlined style={{ color: "white", fontSize: "24px" }} />
              </div>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "18px",
                    color: "#1e293b",
                    display: "flex",
                    marginBottom: "4px",
                  }}
                >
                  Danh sách hồ sơ sức khỏe
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    fontWeight: "400",
                  }}
                >
                  Xem và theo dõi tình trạng sức khỏe của học sinh
                </Text>
              </div>
            </div>
          }
          style={{
            borderRadius: "20px",
            border: "none",
            background: "white",
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
          }}
          bodyStyle={{ padding: "0" }}
        >
          <Table
            columns={columns}
            dataSource={filteredProfiles}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} hồ sơ sức khỏe`,
            }}
            scroll={{ x: 800 }}
            style={{ borderRadius: "0 0 20px 20px" }}
          />
        </Card>

        {/* Modal xem chi tiết hồ sơ sức khỏe */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <HeartOutlined style={{ color: "#10b981", fontSize: "20px" }} />
              <span>Chi tiết hồ sơ sức khỏe học sinh</span>
            </div>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedProfile && (
            <div>
              <Descriptions
                title="Thông tin cơ bản"
                bordered
                column={2}
                size="middle"
                style={{ marginBottom: "24px" }}
              >
                <Descriptions.Item label="Mã hồ sơ" span={1}>
                  <Text strong style={{ color: "#1890ff" }}>
                    HS-{selectedProfile.healthProfileID}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mã học sinh">
                  {selectedProfile.studentId}
                </Descriptions.Item>
                <Descriptions.Item label="Tên học sinh">
                  <Text strong>{selectedProfile.studentName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Lớp">
                  {selectedProfile.studentClass}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions
                title="Thông số cơ thể"
                bordered
                column={2}
                size="middle"
                style={{ marginBottom: "24px" }}
              >
                <Descriptions.Item label="Chiều cao">
                  <Text>{selectedProfile.height} cm</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Cân nặng">
                  <Text>{selectedProfile.weight} kg</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thị lực mắt trái">
                  <Text>{selectedProfile.visionLeft}/10</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thị lực mắt phải">
                  <Text>{selectedProfile.visionRight}/10</Text>
                </Descriptions.Item>
              </Descriptions>

              <Descriptions
                title="Tình trạng sức khỏe"
                bordered
                column={1}
                size="middle"
                style={{ marginBottom: "24px" }}
              >
                <Descriptions.Item label="Tiền sử dị ứng">
                  <Tag
                    color={
                      selectedProfile.allergyHistory !== "Không"
                        ? "orange"
                        : "green"
                    }
                  >
                    {selectedProfile.allergyHistory}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Bệnh mạn tính">
                  <Tag
                    color={
                      selectedProfile.chronicDiseases !== "Không"
                        ? "red"
                        : "green"
                    }
                  >
                    {selectedProfile.chronicDiseases}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tiền sử phẫu thuật">
                  <Text>{selectedProfile.pastSurgeries} lần</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Nguyên nhân phẫu thuật">
                  <Text>{selectedProfile.surgicalCause}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Khuyết tật">
                  <Tag
                    color={
                      selectedProfile.disabilities !== "Không"
                        ? "orange"
                        : "green"
                    }
                  >
                    {selectedProfile.disabilities}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tình trạng răng miệng">
                  <Tag
                    color={
                      selectedProfile.toothDecay !== "Không"
                        ? "orange"
                        : "green"
                    }
                  >
                    {selectedProfile.toothDecay}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Vấn đề sức khỏe khác">
                  <Text>{selectedProfile.otherHealthIssues}</Text>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default HealthProfileView;
