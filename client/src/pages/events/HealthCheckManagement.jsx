import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  DatePicker,
  message,
  Descriptions,
  InputNumber,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  HeartOutlined,
  EditOutlined,
  SearchOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import healthCheckApi from "../../api/healthCheckApi";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function HealthCheckManagement() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("waiting-confirmation"); // 🆕 Tab state: waiting-confirmation, health-check, appointment

  // modal thêm health check
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  // 🆕 modal tạo yêu cầu khám theo lớp (Tab 1)
  const [createByClassModalVisible, setCreateByClassModalVisible] =
    useState(false);
  const [createByClassForm] = Form.useForm();

  // modal chỉnh sửa health check
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  // 🆕 Appointment modals
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [appointmentForm] = Form.useForm();
  const [
    selectedHealthCheckForAppointment,
    setSelectedHealthCheckForAppointment,
  ] = useState(null);

  // 🆕 Edit appointment modal
  const [editAppointmentModalVisible, setEditAppointmentModalVisible] =
    useState(false);
  const [editAppointmentForm] = Form.useForm();
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // API fetch health check data
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await healthCheckApi.nurse.getAll();
      console.log("📊 Health Check API response:", response.data);

      // Map dữ liệu từ backend theo cấu trúc API trả về
      const mappedData = response.data.map((item) => {
        // Tính BMI nếu chưa có
        const calculatedBMI =
          item.bmi ||
          (item.height && item.weight
            ? (item.weight / Math.pow(item.height / 100, 2)).toFixed(1)
            : 0);

        // 🆕 Kiểm tra nếu đây là appointment record (có appointmentID)
        const isAppointment = !!item.appointmentID;

        return {
          id: isAppointment ? item.appointmentID : item.healthCheckUpID,
          key: isAppointment ? item.appointmentID : item.healthCheckUpID,
          // 🆕 Để healthCheckId và appointmentId riêng biệt
          healthCheckId: item.healthCheckUpID,
          appointmentId: isAppointment ? item.appointmentID : null,

          studentId: item.studentID,
          studentName: item.studentName,
          studentClass: item.classID,
          checkDate: item.checkDate,

          // 🆕 Giữ lại dữ liệu chỉ số cơ bản từ health check gốc
          height: item.height || item.healthCheckUp?.height,
          weight: item.weight || item.healthCheckUp?.weight,
          bmi: calculatedBMI || item.healthCheckUp?.bmi,
          visionLeft: item.visionLeft || item.healthCheckUp?.visionLeft,
          visionRight: item.visionRight || item.healthCheckUp?.visionRight,
          bloodPressure:
            item.bloodPressure || item.healthCheckUp?.bloodPressure,
          dental: item.dental || item.healthCheckUp?.dental,
          skin: item.skin || item.healthCheckUp?.skin,
          hearing: item.hearing || item.healthCheckUp?.hearing,
          respiration: item.respiration || item.healthCheckUp?.respiration,
          cardiovascular:
            item.ardiovascular || item.healthCheckUp?.ardiovascular, // Typo từ backend

          notes: item.notes,
          status: getStatusFromBackend(item.status, isAppointment),
          checkerId: item.checkerID,
          checkerName: item.checker?.fullName || "Y tá",
          createdDate: item.checkDate,
          urgencyLevel: "normal", // Default

          // 🆕 Appointment-specific fields
          appointmentDate: item.appointmentDate || item.checkDate,
          appointmentTime: item.appointmentTime || "08:00",
          appointmentLocation: item.appointmentLocation || "Phòng y tế trường",
          appointmentReason: item.appointmentReason || "Khám sức khỏe",

          // 🆕 Flag để biết đây là appointment hay health check
          isAppointment: isAppointment,
        };
      });

      console.log("✅ Health Check mapped data:", mappedData);
      setSubmissions(mappedData);
    } catch (error) {
      console.error("❌ Error fetching health check data:", error);
      message.error("Không thể tải dữ liệu khám sức khỏe!");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  // Chuyển đổi status từ backend theo workflow mới
  const getStatusFromBackend = (backendStatus, isAppointment = false) => {
    if (isAppointment) {
      switch (backendStatus) {
        case "Chờ xác nhận":
          return "appointment-pending";
        case "Đã từ chối":
          return "appointment-rejected";
        case "Đã xác nhận":
          return "appointment-confirmed";
        case "Đã Tham Gia":
          return "attended";
        case "Đã hẹn":
        case "Đã lên lịch":
          return "scheduled";
        default:
          return "appointment-pending";
      }
    }

    // Health Check status mapping
    switch (backendStatus) {
      case "Chờ xác nhận":
        return "pending";
      case "Đã xác nhận":
        return "confirmed";
      case "Từ chối":
        return "rejected";
      case "Chờ khám":
        return "waiting-checkup";
      case "Đang khám":
        return "in-progress";
      case "Hoàn thành":
      case "Đã hoàn thành":
        return "completed";
      case "Cần tái khám":
        return "recheck";
      case "Hủy":
        return "cancelled";
      default:
        return "pending";
    }
  };

  // Xem chi tiết
  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setDetailModalVisible(true);
  };

  // Tạo yêu cầu khám sức khỏe theo lớp (Tab 1 Chờ xác nhận)
  const handleCreateByClass = async (values) => {
    try {
      const createData = {
        classId: values.classId,
        dateCheckUp: values.dateCheckUp
          ? dayjs(values.dateCheckUp).format("YYYY-MM-DD HH:mm:ss")
          : dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };

      console.log("🚀 Creating health check by class - Data:", createData);

      await healthCheckApi.nurse.createByClass(createData);
      fetchSubmissions();
      message.success(
        `Tạo yêu cầu khám sức khỏe cho lớp ${values.classId} thành công!`
      );
      setCreateByClassModalVisible(false);
      createByClassForm.resetFields();
    } catch (error) {
      console.error("❌ Error creating health check by class:", error);
      console.error("❌ Error response:", error.response?.data);

      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message || "Dữ liệu không hợp lệ";
        message.error(`Lỗi: ${errorMessage}`);
      } else if (error.response?.status === 404) {
        message.error("Lớp học không tồn tại! Vui lòng kiểm tra lại.");
      } else {
        message.error("Tạo yêu cầu khám sức khỏe thất bại!");
      }
    }
  };

  // Tạo mới health check (manual - Tab 2)
  const handleCreateHealthCheck = async (values) => {
    try {
      const createData = {
        StudentID: values.studentId,
        CheckDate: values.checkDate
          ? dayjs(values.checkDate).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        Height: values.height,
        Weight: values.weight,
        BMI: values.bmi,
        VisionLeft: values.visionLeft,
        VisionRight: values.visionRight,
        BloodPressure: values.bloodPressure,
        Dental: values.dental,
        Skin: values.skin,
        Hearing: values.hearing,
        Respiration: values.respiration,
        Cardiovascular: values.cardiovascular,
        Notes: values.notes,
        Status: "Hoàn thành",
      };

      console.log("🚀 Creating health check - Data:", createData);

      await healthCheckApi.nurse.create(createData);
      fetchSubmissions();
      message.success("Tạo hồ sơ khám sức khỏe thành công!");
      setCreateModalVisible(false);
      createForm.resetFields();
    } catch (error) {
      console.error("❌ Error creating health check:", error);
      console.error("❌ Error response:", error.response?.data);
      message.error("Tạo hồ sơ khám sức khỏe thất bại!");
    }
  };

  // Chỉnh sửa health check
  const handleEdit = (submission) => {
    setSelectedSubmission(submission);

    editForm.setFieldsValue({
      height: submission.height,
      weight: submission.weight,
      bmi: submission.bmi,
      visionLeft: submission.visionLeft,
      visionRight: submission.visionRight,
      bloodPressure: submission.bloodPressure,
      dental: submission.dental,
      skin: submission.skin,
      hearing: submission.hearing,
      respiration: submission.respiration,
      cardiovascular: submission.cardiovascular,
      notes: submission.notes,
    });

    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      const updateData = {
        Height: values.height,
        Weight: values.weight,
        BMI: values.bmi,
        VisionLeft: values.visionLeft,
        VisionRight: values.visionRight,
        BloodPressure: values.bloodPressure,
        Dental: values.dental,
        Skin: values.skin,
        Hearing: values.hearing,
        Respiration: values.respiration,
        Cardiovascular: values.cardiovascular,
        Notes: values.notes,
      };

      console.log(
        "🚀 Updating health check - healthCheckId:",
        selectedSubmission.healthCheckId
      );
      console.log("🚀 Updating health check - Data:", updateData);

      await healthCheckApi.nurse.update(
        selectedSubmission.healthCheckId,
        updateData
      );
      fetchSubmissions();
      message.success("Cập nhật hồ sơ khám sức khỏe thành công!");
      setEditModalVisible(false);
      editForm.resetFields();
    } catch (error) {
      console.error("❌ Error updating health check:", error);
      console.error("❌ Error response:", error.response?.data);
      message.error("Cập nhật hồ sơ khám sức khỏe thất bại!");
    }
  };

  // Tính BMI tự động
  const calculateBMI = (height, weight) => {
    if (height && weight) {
      const bmi = weight / Math.pow(height / 100, 2);
      return bmi.toFixed(1);
    }
    return null;
  };

  // Tính số lượng records cho từng tab
  const getTabCounts = () => {
    const waitingConfirmationCount = submissions.filter((s) =>
      ["pending", "confirmed", "rejected"].includes(s.status)
    ).length;

    const healthCheckCount = submissions.filter((s) =>
      ["waiting-checkup", "in-progress", "completed"].includes(s.status)
    ).length;

    const appointmentCount = submissions.filter((s) =>
      [
        "scheduled",
        "appointment-pending",
        "appointment-confirmed",
        "appointment-rejected",
        "attended",
      ].includes(s.status)
    ).length;

    return {
      waitingConfirmation: waitingConfirmationCount,
      healthCheck: healthCheckCount,
      appointment: appointmentCount,
    };
  };

  const tabCounts = getTabCounts();

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning"; 
      case "confirmed":
        return "blue"; 
      case "rejected":
        return "error"; 
      case "waiting-checkup":
        return "processing"; 
      case "in-progress":
        return "cyan"; 
      case "completed":
        return "success"; 
      case "recheck":
        return "orange"; 
      case "cancelled":
        return "error";     
      case "scheduled":
        return "purple"; 
      case "appointment-pending":
        return "warning"; 
      case "appointment-confirmed":
        return "green"; 
      case "appointment-rejected":
        return "red"; 
      case "attended":
        return "success"; 
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "rejected":
        return "Từ chối";
      case "waiting-checkup":
        return "Chờ khám";
      case "in-progress":
        return "Đang khám";
      case "completed":
        return "Hoàn thành";
      case "recheck":
        return "Cần tái khám";
      case "cancelled":
        return "Đã hủy";
      // Appointment statuses
      case "scheduled":
        return "Đã lên lịch hẹn";
      case "appointment-pending":
        return "Chờ xác nhận";
      case "appointment-confirmed":
        return "Đã xác nhận";
      case "appointment-rejected":
        return "Đã từ chối";
      case "attended":
        return "Đã tham gia";
      default:
        return status;
    }
  };

  const classes = ["1A", "2A", "3A", "4A", "5A"];
  const statuses = [
    "pending",
    "confirmed",
    "rejected", // Tab 1
    "waiting-checkup",
    "in-progress",
    "completed", // Tab 2
    "scheduled",
    "appointment-pending",
    "appointment-confirmed",
    "appointment-rejected",
    "attended", // Tab 3
  ];

  // Handle search function
  const handleSearch = () => {
    console.log("🔍 Searching for:", searchText);
  };

  // Filter logic with 3 tabs workflow
  const filteredSubmissions = submissions.filter((submission) => {
    // Tab filtering first
    let matchesTab = false;
    if (activeTab === "waiting-confirmation") {
      // Tab 1: Chờ xác nhận (pending, confirmed, rejected)
      matchesTab = ["pending", "confirmed", "rejected"].includes(
        submission.status
      );
    } else if (activeTab === "health-check") {
      // Tab 2: Khám sức khỏe (waiting-checkup, in-progress, completed)
      matchesTab = ["waiting-checkup", "in-progress", "completed"].includes(
        submission.status
      );
    } else if (activeTab === "appointment") {
      // Tab 3: Lịch hẹn (appointment statuses)
      matchesTab = [
        "scheduled",
        "appointment-pending",
        "appointment-confirmed",
        "appointment-rejected",
        "attended",
      ].includes(submission.status);
    }

    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;
    const matchesClass =
      classFilter === "all" || submission.studentClass === classFilter;

    // Multi-field search: studentId, studentName, studentClass
    const search = searchText.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (submission.studentId &&
        String(submission.studentId).toLowerCase().includes(search)) ||
      (submission.studentName &&
        String(submission.studentName).toLowerCase().includes(search)) ||
      (submission.studentClass &&
        String(submission.studentClass).toLowerCase().includes(search));

    return matchesTab && matchesStatus && matchesClass && matchesSearch;
  });

  const columns = [
    {
      title: "Mã khám",
      dataIndex: "healthCheckId",
      key: "healthCheckId",
      width: 90,
      render: (text, record) => (
        <div>
          <Text strong style={{ color: "#1890ff", fontSize: "12px" }}>
            {record.isAppointment ? record.appointmentId : record.healthCheckId}
          </Text>
          {record.isAppointment && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: "10px" }}>
                (Lịch hẹn)
              </Text>
            </>
          )}
        </div>
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
      title: "Chỉ số cơ bản",
      key: "basicStats",
      width: 150,
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: "13px" }}>
            <strong>Cao:</strong> {record.height}cm
          </Text>
          <br />
          <Text style={{ fontSize: "13px" }}>
            <strong>Nặng:</strong> {record.weight}kg
          </Text>
          <br />
          <Text style={{ fontSize: "13px", color: "#722ed1" }}>
            <strong>BMI:</strong> {record.bmi}
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
          <Tag color="blue" style={{ fontSize: "11px", marginBottom: "2px" }}>
            👀 Thị lực: {record.visionLeft}/{record.visionRight}
          </Tag>
          <br />
          <Tag color="green" style={{ fontSize: "11px", marginBottom: "2px" }}>
            🦷 Răng: {record.dental}
          </Tag>
          <br />
          <Tag color="orange" style={{ fontSize: "11px" }}>
            💓 Huyết áp: {record.bloodPressure}
          </Tag>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          style={{ fontSize: "11px", padding: "2px 6px" }}
        >
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Ngày khám",
      dataIndex: "checkDate",
      key: "checkDate",
      width: 100,
      render: (date) => (
        <div style={{ fontSize: "12px" }}>
          <div>{dayjs(date).format("DD/MM/YYYY")}</div>
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {dayjs(date).format("HH:mm")}
          </Text>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 160,
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

          {/* Tab 1: Chờ xác nhận  */}
          {activeTab !== "waiting-confirmation" && (
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              style={{ padding: "0 6px", fontSize: "12px", marginRight: "4px" }}
            >
              Cập nhật
            </Button>
          )}

          {/* Tab 2: Khám sức khỏe */}
          {activeTab === "health-check" && (
            <>
              {record.status === "completed" && (
                <Button
                  type="link"
                  icon={<CalendarOutlined />}
                  size="small"
                  onClick={() => {
                    console.log(
                      "🎯 Tạo lịch hẹn cho health check đã hoàn thành:",
                      record
                    );
                    showAppointmentModal(record);
                  }}
                  style={{
                    padding: "0 4px",
                    fontSize: "12px",
                    color: "#faad14",
                  }}
                  title="Tạo lịch hẹn (chỉ khi đã hoàn thành khám)"
                >
                  Hẹn khám
                </Button>
              )}
              {record.status !== "completed" &&
                console.log(
                  "ℹ️ Không hiển thị nút Hẹn khám vì status:",
                  record.status,
                  "!== 'completed'"
                )}
            </>
          )}

          {/* Tab 3: Lịch hẹn */}
          {activeTab === "appointment" && (
            <>
              <Button
                type="default"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEditAppointment(record)}
                style={{
                  padding: "0 6px",
                  fontSize: "12px",
                  marginRight: "4px",
                }}
                title="Cập nhật lịch hẹn"
              >
                Cập nhật
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Handle tạo lịch hẹn khám sức khỏe (cho tab 2)
  const showAppointmentModal = (record) => {
    setSelectedHealthCheckForAppointment(record);
    appointmentForm.setFieldsValue({
      studentId: record.studentId,
      studentName: record.studentName,
      studentClass: record.studentClass,
      purpose: "Khám sức khỏe định kỳ",
      appointmentDate: dayjs().add(1, "day"),
      appointmentTime: "08:00",
    });
    setAppointmentModalVisible(true);
  };

  // Handle edit appointment (cho Tab 3)
  const handleEditAppointment = (record) => {
    console.log("🔧 Edit appointment:", record);
    setSelectedAppointment(record);
    editAppointmentForm.setFieldsValue({
      studentId: record.studentId,
      studentName: record.studentName,
      studentClass: record.studentClass,
      appointmentDate: record.appointmentDate
        ? dayjs(record.appointmentDate)
        : dayjs(),
      appointmentTime: record.appointmentTime || "08:00",
      purpose: record.appointmentReason || "Khám sức khỏe",
      notes: record.notes || "",
      status: record.status,
    });
    setEditAppointmentModalVisible(true);
  };

  // 🆕 Handle submit edit appointment
  const handleEditAppointmentSubmit = async (values) => {
    try {
      // Sử dụng appointmentId thật từ backend, không phải mock ID
      const appointmentId =
        selectedAppointment.appointmentId || selectedAppointment.healthCheckId;

      const updateData = {
        notes: values.notes || "",
      };

      console.log("🚀 Updating appointment - appointmentId:", appointmentId);
      console.log("🚀 Update data:", updateData);

      // 🆕 Gọi API cập nhật lịch hẹn với appointmentId thật
      await healthCheckApi.nurse.updateAppointment(appointmentId, updateData);

      message.success("Đã cập nhật lịch hẹn thành công!");
      setEditAppointmentModalVisible(false);
      editAppointmentForm.resetFields();
      setSelectedAppointment(null);

      // Refresh submissions data thay vì fetchAppointments
      await fetchSubmissions();
    } catch (error) {
      console.error("❌ Error updating appointment:", error);
      message.error("Không thể cập nhật lịch hẹn! Vui lòng thử lại.");
    }
  };

  const handleAppointmentSubmit = async (values) => {
    try {
      // Format datetime theo yêu cầu API: "2025-07-09T13:56:36.220Z"
      const appointmentDateTime = `${values.appointmentDate.format(
        "YYYY-MM-DD"
      )}T${values.appointmentTime}:00.000Z`;

      const appointmentData = {
        dateTime: appointmentDateTime,
        location: "Phòng y tế trường",
        reason: values.purpose,
        notes: values.notes || "",
        healthCheckUpID:
          selectedHealthCheckForAppointment?.healthCheckId ||
          selectedHealthCheckForAppointment?.id ||
          "",
      };

      console.log("🚀 Creating appointment:", appointmentData);
      console.log(
        "� Health check ID:",
        selectedHealthCheckForAppointment?.healthCheckId
      );

      // 🆕 Gọi API tạo lịch hẹn - Backend sẽ tự động tạo appointment record mới
      await healthCheckApi.nurse.createAppointment(appointmentData);

      // 🚀 Không cập nhật status của health check record cũ
      // Backend sẽ tạo appointment record mới với appointmentID và status "Chờ xác nhận"

      message.success("Đã tạo lịch hẹn khám sức khỏe thành công!");
      setAppointmentModalVisible(false);
      appointmentForm.resetFields();
      setSelectedHealthCheckForAppointment(null);

      // 🆕 Refresh submissions data để lấy appointment record mới từ backend
      console.log("🔄 Đang refresh dữ liệu sau khi tạo lịch hẹn...");
      await fetchSubmissions(); // Refresh để lấy appointment record mới

      console.log("✅ Hoàn thành refresh dữ liệu");
    } catch (error) {
      console.error("❌ Error creating appointment:", error);
      message.error("Không thể tạo lịch hẹn! Vui lòng thử lại.");
    }
  };

  // Fetch data khi component mount
  useEffect(() => {
    fetchSubmissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
        minHeight: "100vh",
        padding: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg, #0DACCD 0%, #2980b9 100%)",
          borderRadius: "0 0 32px 32px",
          padding: "40px 32px 48px",
          marginBottom: "40px",
          boxShadow: "0 25px 50px rgba(16, 185, 129, 0.25)",
        }}
      >
        <Row align="middle" justify="space-between">
          <Col xs={24} md={16}>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "20px",
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 15px 35px rgba(239, 68, 68, 0.4)",
                }}
              >
                <span style={{ fontSize: "36px" }}>🏥</span>
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
                  }}
                >
                  Quản Lý Khám Sức Khỏe
                </Title>
                <Text
                  style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: "500",
                  }}
                >
                  Hệ thống theo dõi và quản lý sức khỏe học sinh
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "16px",
                  padding: "12px 16px",
                  textAlign: "center",
                  minWidth: "100px",
                }}
              >
                <div style={{ fontSize: "18px", marginBottom: "4px" }}>📊</div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  {submissions.length}
                </div>
                <Text
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Tổng hồ sơ
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <div style={{ padding: "0 32px 32px" }}>
        {/* Thống kê */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <HeartOutlined style={{ fontSize: "24px", color: "#ef4444" }} />
              <Text strong style={{ fontSize: "18px" }}>
                Thống kê sức khỏe học sinh
              </Text>
            </div>
          }
          style={{ marginBottom: "32px", borderRadius: "20px" }}
        >
          <Row gutter={[20, 20]}>
            <Col xs={12} sm={6}>
              <Card
                style={{
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                  borderRadius: "16px",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#d97706",
                  }}
                >
                  {submissions.filter((s) => s.status === "pending").length}
                </div>
                <Text style={{ fontSize: "13px", color: "#92400e" }}>
                  Chờ khám
                </Text>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card
                style={{
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  borderRadius: "16px",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔄</div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#2563eb",
                  }}
                >
                  {submissions.filter((s) => s.status === "in-progress").length}
                </div>
                <Text style={{ fontSize: "13px", color: "#1d4ed8" }}>
                  Đang khám
                </Text>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card
                style={{
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                  borderRadius: "16px",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#16a34a",
                  }}
                >
                  {submissions.filter((s) => s.status === "completed").length}
                </div>
                <Text style={{ fontSize: "13px", color: "#15803d" }}>
                  Hoàn thành
                </Text>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card
                style={{
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)",
                  borderRadius: "16px",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔄</div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#dc2626",
                  }}
                >
                  {submissions.filter((s) => s.status === "recheck").length}
                </div>
                <Text style={{ fontSize: "13px", color: "#b91c1c" }}>
                  Tái khám
                </Text>
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
                  Lọc theo trạng thái, lớp học và tìm kiếm theo mã học sinh
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
              {/* Trạng thái */}
              <Col xs={24} sm={12} md={8} lg={5}>
                <div style={{ marginBottom: "6px" }}>
                  <Text
                    strong
                    style={{
                      fontSize: "13px",
                      color: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>🎯</span>{" "}
                    <span>Trạng thái</span>
                  </Text>
                </div>
                <Select
                  placeholder="Chọn trạng thái"
                  style={{ width: "100%" }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  size="middle"
                >
                  <Option value="all">
                    <span style={{ fontSize: "13px", color: "#666" }}>
                      📋 Tất cả
                    </span>
                  </Option>
                  {statuses.map((status) => (
                    <Option key={status} value={status}>
                      <span style={{ fontSize: "13px" }}>
                        {status === "pending"
                          ? "⏳ Chờ khám"
                          : status === "in-progress"
                          ? "🔄 Đang khám"
                          : status === "completed"
                          ? "✅ Hoàn thành"
                          : status === "recheck"
                          ? "🔄 Tái khám"
                          : status === "cancelled"
                          ? "❌ Đã hủy"
                          : "📋"}
                      </span>
                    </Option>
                  ))}
                </Select>
              </Col>

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

        {/* 📋 Bảng danh sách khám sức khỏe với Tabs */}
        <Card
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1f2937",
                    display: "flex",
                    marginBottom: "4px",
                  }}
                >
                  Quản lý khám sức khỏe học sinh
                </div>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    fontWeight: "400",
                  }}
                >
                  Quản lý hồ sơ khám sức khỏe định kỳ và lịch hẹn khám
                </Text>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Button
                  type="default"
                  icon={<CalendarOutlined />}
                  onClick={() => setCreateByClassModalVisible(true)}
                  style={{
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #faad14 0%, #ffd666 100%)",
                    borderColor: "#faad14",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(250, 173, 20, 0.3)",
                    fontWeight: "600",
                  }}
                  size="middle"
                >
                  Tạo theo lớp
                </Button>
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
          {/* 🎯 Tabs cho workflow khám sức khỏe theo 3 bước */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ padding: "24px 24px 0 24px" }}
            size="large"
            type="card"
            items={[
              {
                key: "waiting-confirmation",
                label: (
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>
                    ⏳ Chờ xác nhận ({tabCounts.waitingConfirmation})
                  </span>
                ),
                children: (
                  /* Bảng danh sách cho Tab 1: Chờ xác nhận */
                  <Table
                    columns={columns}
                    dataSource={filteredSubmissions}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} yêu cầu`,
                    }}
                    scroll={{ x: 800 }}
                    style={{ borderRadius: "0 0 20px 20px" }}
                  />
                ),
              },
              {
                key: "health-check",
                label: (
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>
                    🩺 Khám sức khỏe ({tabCounts.healthCheck})
                  </span>
                ),
                children: (
                  /* Bảng danh sách cho Tab 2: Khám sức khỏe */
                  <Table
                    columns={columns}
                    dataSource={filteredSubmissions}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} hồ sơ khám`,
                    }}
                    scroll={{ x: 800 }}
                    style={{ borderRadius: "0 0 20px 20px" }}
                  />
                ),
              },
              {
                key: "appointment",
                label: (
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>
                    📅 Lịch hẹn ({tabCounts.appointment})
                  </span>
                ),
                children: (
                  /* Bảng danh sách cho Tab 3: Lịch hẹn - sử dụng filteredSubmissions thay vì appointments */
                  <Table
                    columns={columns}
                    dataSource={filteredSubmissions}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} lịch hẹn`,
                    }}
                    scroll={{ x: 800 }}
                    style={{ borderRadius: "0 0 20px 20px" }}
                  />
                ),
              },
            ]}
          />
        </Card>

        {/* Modal chi tiết */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <EyeOutlined style={{ color: "#1890ff", fontSize: "20px" }} />
              <span>Chi tiết khám sức khỏe</span>
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
          {selectedSubmission && (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã khám" span={2}>
                <Text strong style={{ color: "#1890ff" }}>
                  {selectedSubmission.healthCheckId}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Học sinh">
                {selectedSubmission.studentName}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp">
                {selectedSubmission.studentClass}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày khám" span={2}>
                {dayjs(selectedSubmission.checkDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Chiều cao">
                {selectedSubmission.height} cm
              </Descriptions.Item>
              <Descriptions.Item label="Cân nặng">
                {selectedSubmission.weight} kg
              </Descriptions.Item>
              <Descriptions.Item label="BMI">
                {selectedSubmission.bmi}
              </Descriptions.Item>
              <Descriptions.Item label="Huyết áp">
                {selectedSubmission.bloodPressure}
              </Descriptions.Item>
              <Descriptions.Item label="Thị lực trái">
                {selectedSubmission.visionLeft}
              </Descriptions.Item>
              <Descriptions.Item label="Thị lực phải">
                {selectedSubmission.visionRight}
              </Descriptions.Item>
              <Descriptions.Item label="Răng miệng">
                {selectedSubmission.dental}
              </Descriptions.Item>
              <Descriptions.Item label="Da">
                {selectedSubmission.skin}
              </Descriptions.Item>
              <Descriptions.Item label="Thính giác">
                {selectedSubmission.hearing}
              </Descriptions.Item>
              <Descriptions.Item label="Hô hấp">
                {selectedSubmission.respiration}
              </Descriptions.Item>
              <Descriptions.Item label="Tim mạch" span={2}>
                {selectedSubmission.cardiovascular}
              </Descriptions.Item>
              {selectedSubmission.notes && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedSubmission.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>

        {/* Modal thêm mới */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <PlusOutlined style={{ color: "#52c41a", fontSize: "20px" }} />
              <span>Thêm hồ sơ khám sức khỏe</span>
            </div>
          }
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onOk={() => createForm.submit()}
          okText="Thêm hồ sơ"
          cancelText="Hủy"
          width={700}
        >
          <Form
            form={createForm}
            layout="vertical"
            onFinish={handleCreateHealthCheck}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Mã học sinh"
                  name="studentId"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã học sinh!" },
                  ]}
                >
                  <Input placeholder="Nhập mã học sinh..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Ngày khám"
                  name="checkDate"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày khám!" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Chiều cao (cm)"
                  name="height"
                  rules={[
                    { required: true, message: "Vui lòng nhập chiều cao!" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={300}
                    placeholder="150"
                    onChange={(height) => {
                      const weight = createForm.getFieldValue("weight");
                      const bmi = calculateBMI(height, weight);
                      if (bmi) createForm.setFieldsValue({ bmi: Number(bmi) });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Cân nặng (kg)"
                  name="weight"
                  rules={[
                    { required: true, message: "Vui lòng nhập cân nặng!" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={200}
                    placeholder="45"
                    onChange={(weight) => {
                      const height = createForm.getFieldValue("height");
                      const bmi = calculateBMI(height, weight);
                      if (bmi) createForm.setFieldsValue({ bmi: Number(bmi) });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="BMI" name="bmi">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={50}
                    disabled
                    placeholder="Tự động tính"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Thị lực trái" name="visionLeft">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={20}
                    placeholder="10"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Thị lực phải" name="visionRight">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={20}
                    placeholder="10"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Huyết áp" name="bloodPressure">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={300}
                    placeholder="120"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Răng miệng" name="dental">
                  <Select placeholder="Chọn tình trạng răng">
                    <Option value="Tốt">Tốt</Option>
                    <Option value="Bình thường">Bình thường</Option>
                    <Option value="Cần điều trị">Cần điều trị</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Da" name="skin">
                  <Select placeholder="Chọn tình trạng da">
                    <Option value="Bình thường">Bình thường</Option>
                    <Option value="Khô">Khô</Option>
                    <Option value="Dị ứng">Dị ứng</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Thính giác" name="hearing">
                  <Select placeholder="Tình trạng thính giác">
                    <Option value="Tốt">Tốt</Option>
                    <Option value="Giảm">Giảm</Option>
                    <Option value="Cần kiểm tra">Cần kiểm tra</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Hô hấp" name="respiration">
                  <Select placeholder="Tình trạng hô hấp">
                    <Option value="Bình thường">Bình thường</Option>
                    <Option value="Khó thở">Khó thở</Option>
                    <Option value="Hen suyễn">Hen suyễn</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Tim mạch" name="cardiovascular">
                  <Select placeholder="Tình trạng tim mạch">
                    <Option value="Tốt">Tốt</Option>
                    <Option value="Bình thường">Bình thường</Option>
                    <Option value="Cần theo dõi">Cần theo dõi</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Ghi chú" name="notes">
              <TextArea rows={3} placeholder="Nhập ghi chú..." />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal chỉnh sửa */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <EditOutlined style={{ color: "#722ed1", fontSize: "20px" }} />
              <span>Chỉnh sửa hồ sơ khám sức khỏe</span>
            </div>
          }
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onOk={() => editForm.submit()}
          okText="Lưu thay đổi"
          cancelText="Hủy"
          width={700}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Chiều cao (cm)" name="height">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={300}
                    onChange={(height) => {
                      const weight = editForm.getFieldValue("weight");
                      const bmi = calculateBMI(height, weight);
                      if (bmi) editForm.setFieldsValue({ bmi: Number(bmi) });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Cân nặng (kg)" name="weight">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={200}
                    onChange={(weight) => {
                      const height = editForm.getFieldValue("height");
                      const bmi = calculateBMI(height, weight);
                      if (bmi) editForm.setFieldsValue({ bmi: Number(bmi) });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="BMI" name="bmi">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={50}
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Thị lực trái" name="visionLeft">
                  <InputNumber style={{ width: "100%" }} min={0} max={20} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Thị lực phải" name="visionRight">
                  <InputNumber style={{ width: "100%" }} min={0} max={20} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Huyết áp" name="bloodPressure">
                  <InputNumber style={{ width: "100%" }} min={0} max={300} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Răng miệng" name="dental">
                  <Select>
                    <Option value="Tốt">Tốt</Option>
                    <Option value="Bình thường">Bình thường</Option>
                    <Option value="Cần điều trị">Cần điều trị</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Da" name="skin">
                  <Select>
                    <Option value="Bình thường">Bình thường</Option>
                    <Option value="Khô">Khô</Option>
                    <Option value="Dị ứng">Dị ứng</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Thính giác" name="hearing">
                  <Select>
                    <Option value="Tốt">Tốt</Option>
                    <Option value="Giảm">Giảm</Option>
                    <Option value="Cần kiểm tra">Cần kiểm tra</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Hô hấp" name="respiration">
                  <Select>
                    <Option value="Bình thường">Bình thường</Option>
                    <Option value="Khó thở">Khó thở</Option>
                    <Option value="Hen suyễn">Hen suyễn</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Tim mạch" name="cardiovascular">
                  <Select>
                    <Option value="Tốt">Tốt</Option>
                    <Option value="Bình thường">Bình thường</Option>
                    <Option value="Cần theo dõi">Cần theo dõi</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Ghi chú" name="notes">
              <TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal tạo lịch hẹn */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <CalendarOutlined
                style={{ color: "#faad14", fontSize: "20px" }}
              />
              <span>Tạo lịch hẹn khám sức khỏe</span>
            </div>
          }
          open={appointmentModalVisible}
          onCancel={() => setAppointmentModalVisible(false)}
          onOk={() => appointmentForm.submit()}
          okText="Tạo lịch hẹn"
          cancelText="Hủy"
          width={600}
        >
          <Form
            form={appointmentForm}
            layout="vertical"
            onFinish={handleAppointmentSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Mã học sinh"
                  name="studentId"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã học sinh!" },
                  ]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tên học sinh"
                  name="studentName"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên học sinh!" },
                  ]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Lớp"
                  name="studentClass"
                  rules={[{ required: true, message: "Vui lòng chọn lớp!" }]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Mục đích khám"
                  name="purpose"
                  rules={[
                    { required: true, message: "Vui lòng nhập mục đích khám!" },
                  ]}
                >
                  <Select>
                    <Option value="Khám sức khỏe định kỳ">
                      Khám sức khỏe định kỳ
                    </Option>
                    <Option value="Tái khám">Tái khám</Option>
                    <Option value="Khám theo yêu cầu">Khám theo yêu cầu</Option>
                    <Option value="Khám cấp cứu">Khám cấp cứu</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Ngày hẹn"
                  name="appointmentDate"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày hẹn!" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày hẹn"
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Giờ hẹn"
                  name="appointmentTime"
                  rules={[
                    { required: true, message: "Vui lòng chọn giờ hẹn!" },
                  ]}
                >
                  <Select>
                    <Option value="08:00">08:00</Option>
                    <Option value="08:30">08:30</Option>
                    <Option value="09:00">09:00</Option>
                    <Option value="09:30">09:30</Option>
                    <Option value="10:00">10:00</Option>
                    <Option value="10:30">10:30</Option>
                    <Option value="11:00">11:00</Option>
                    <Option value="13:30">13:30</Option>
                    <Option value="14:00">14:00</Option>
                    <Option value="14:30">14:30</Option>
                    <Option value="15:00">15:00</Option>
                    <Option value="15:30">15:30</Option>
                    <Option value="16:00">16:00</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Ghi chú" name="notes">
              <TextArea rows={3} placeholder="Nhập ghi chú cho lịch hẹn..." />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal tạo khám sức khỏe theo lớp */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <HeartOutlined style={{ color: "#52c41a", fontSize: "20px" }} />
              <span>Tạo khám sức khỏe theo lớp</span>
            </div>
          }
          open={createByClassModalVisible}
          onCancel={() => setCreateByClassModalVisible(false)}
          onOk={() => createByClassForm.submit()}
          okText="Tạo khám sức khỏe"
          cancelText="Hủy"
          width={600}
        >
          <Form
            form={createByClassForm}
            layout="vertical"
            onFinish={handleCreateByClass}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Lớp học"
                  name="classId"
                  rules={[{ required: true, message: "Vui lòng chọn lớp!" }]}
                >
                  <Select placeholder="Chọn lớp học">
                    {classes.map((classId) => (
                      <Option key={classId} value={classId}>
                        {classId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Ngày khám dự kiến"
                  name="dateCheckUp"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày khám!" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn ngày giờ khám"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Ghi chú" name="notes">
              <TextArea
                rows={3}
                placeholder="Nhập ghi chú cho đợt khám sức khỏe theo lớp..."
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal chỉnh sửa lịch hẹn */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <EditOutlined style={{ color: "#1890ff", fontSize: "20px" }} />
              <span>Cập nhật lịch hẹn khám sức khỏe</span>
            </div>
          }
          open={editAppointmentModalVisible}
          onCancel={() => setEditAppointmentModalVisible(false)}
          onOk={() => editAppointmentForm.submit()}
          okText="Cập nhật"
          cancelText="Hủy"
          width={600}
        >
          <Form
            form={editAppointmentForm}
            layout="vertical"
            onFinish={handleEditAppointmentSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Mã học sinh" name="studentId">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tên học sinh" name="studentName">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Lớp" name="studentClass">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Mục đích khám" name="purpose">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Ngày hẹn" name="appointmentDate">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Giờ hẹn" name="appointmentTime">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Ghi chú"
              name="notes"
              extra="Chỉ có thể cập nhật ghi chú cho lịch hẹn này"
            >
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú mới cho lịch hẹn..."
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default HealthCheckManagement;
