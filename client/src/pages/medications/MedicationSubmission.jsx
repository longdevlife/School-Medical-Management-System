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
} from "antd";
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import medicineApi from "../../api/medicineApi";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function MedicationSubmission() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [studentSearchText, setStudentSearchText] = useState(""); // 🆕 Search by StudentID
  const [searchLoading, setSearchLoading] = useState(false); // 🆕 Loading state for search
  const [form] = Form.useForm();

  // modal thêm thuốc
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  // modal cập nhật tiến độ
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateForm] = Form.useForm();

  // modal chỉnh sửa thuốc
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  const getStatusFromBackend = (backendStatus) => {
    switch (backendStatus) {
      case "Chờ xử lý":
        return "pending";
      case "Chờ xác nhận": 
        return "pending";
      case "Đã xác nhận":
      case "Đã duyệt":
        return "approved";
      case "Đang sử dụng":
      case "Đang thực hiện": 
        return "in-use";
      case "Hoàn thành":
      case "Đã hoàn thành": 
        return "completed";
      case "Từ chối":
        return "rejected";
      default:
        return "pending";
    }
  };

  // API fetch data
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await medicineApi.nurse.getAll();
      console.log("API response:", response.data);

      // 🔍 DEBUG: Kiểm tra studentID trong API response
      console.log("🔍 First item studentID:", response.data[0]?.studentID);
      console.log(
        "🔍 All studentIDs:",
        response.data.map((item) => item.studentID)
      );

      const mappedData = response.data.map((item) => ({
        id: item.medicineID,
        key: item.medicineID,
        submissionCode: item.medicineID,
        studentId: item.studentID, // ✅ Map từ API
        studentName: item.studentName || "Chưa có tên",
        studentClass: item.className || "Chưa có lớp",
        medicationName: item.medicineName,
        dosage: item.dosage,
        frequency: "Chưa có",
        duration: "Chưa có",
        instructions: item.instructions,
        reason: "Chưa có",
        quantity: item.quantity,
        status: getStatusFromBackend(item.status),
        submissionDate: item.sentDate,
        verifiedBy: item.nurseID || null,
        verifiedDate: null,
        verificationNotes: item.notes,
        urgencyLevel: "normal",
        medicationImages: item.image ? [item.image] : [],
        prescriptionImage: null,
        parentSignature: null,
        administrationTimes: [],
        createdBy: item.parentID
          ? "parent"
          : item.status === "Chờ xử lý"
          ? "parent"
          : "nurse",
      }));

      setSubmissions(mappedData);
    } catch (error) {
      console.error("Lỗi fetch api:", error);
      message.error("Không thể tải danh sách thuốc. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (submission) => {
    setSelectedSubmission(submission);
    form.setFieldsValue({
      status: submission.status === "pending" ? "approved" : submission.status,
      verificationNotes: submission.verificationNotes || "",
    });
    setVerifyModalVisible(true);
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setDetailModalVisible(true);
  };

  // Tạo mới thuốc
  const handleCreateMedicine = async (values) => {
    try {
      const createData = {
        MedicineName: values.medicineName,
        Quantity: values.quantity,
        Dosage: values.dosage,
        Instructions: values.instructions,
        StudentID: values.studentId,
        Status: "Chờ xử lý",
        Image: values.image?.[0]?.originFileObj || null,
      };

      console.log("🚀 Data gửi lên API:", createData);
      console.log("📝 Form values:", values);

      await medicineApi.nurse.create(createData);
      message.success("Thêm thuốc mới thành công!");
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchSubmissions();
    } catch (error) {
      console.error("Lỗi tạo thuốc:", error);
      // Error handling đơn giản
      if (error.response?.status === 500) {
        message.error("Student ID không tồn tại! Vui lòng kiểm tra lại.");
      } else {
        message.error("Thêm thuốc thất bại!");
      }
    }
  };

  // Xử lý yêu cầu thuốc
  const handleVerifySubmit = async (values) => {
    try {
      const updateData = {
        StudentID: selectedSubmission.studentId,
        MedicineName: selectedSubmission.medicineName,
        Quantity: selectedSubmission.quantity,
        Dosage: selectedSubmission.dosage,
        Instructions: selectedSubmission.instructions,
        Status: values.status === "approved" ? "Đã xác nhận" : "Từ chối",
        Notes: values.verificationNotes,
        SentDate: selectedSubmission.submissionDate,
        ParentID: selectedSubmission.parentId || null,
      };

      console.log("🚀 Verify Submit - JSON Data gửi lên API:", updateData);
      console.log("📝 Form values:", values);
      console.log("📋 Selected submission:", selectedSubmission);

      // Kiểm tra ID hợp lệ trước khi gọi API
      if (
        !selectedSubmission.id ||
        selectedSubmission.id.toString().startsWith("TEST_")
      ) {
        message.error("ID thuốc không hợp lệ! Không thể cập nhật test data.");
        return;
      }

      await medicineApi.nurse.update(selectedSubmission.id, updateData);

      fetchSubmissions();

      message.success(
        values.status === "approved"
          ? "Đã xác nhận nhận thuốc từ phụ huynh!"
          : "Đã từ chối yêu cầu thuốc!"
      );
      setVerifyModalVisible(false);
    } catch (error) {
      console.error("❌ Lỗi xử lý yêu cầu:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      if (error.response?.status === 400) {
        const validationErrors =
          error.response?.data?.errors || error.response?.data?.message;
        if (validationErrors) {
          message.error(
            `Validation Error: ${JSON.stringify(validationErrors)}`
          );
        } else {
          message.error("Dữ liệu gửi lên không hợp lệ! Vui lòng kiểm tra lại.");
        }
      } else if (error.response?.status === 404) {
        message.error("Không tìm thấy thuốc cần cập nhật!");
      } else {
        message.error("Xử lý yêu cầu thất bại!");
      }
    }
  };

  // Cập nhật tiến độ
  const handleUpdateProgress = (submission) => {
    setSelectedSubmission(submission);
    updateForm.setFieldsValue({
      currentStatus: submission.status,
      newStatus: submission.status === "approved" ? "in-use" : "completed",
      progressNotes: "",
      administrationTime: dayjs(),
    });
    setUpdateModalVisible(true);
  };

  const handleUpdateProgressSubmit = async (values) => {
    try {
      let backendStatus;
      switch (values.newStatus) {
        case "in-use":
          backendStatus = "Đang thực hiện";
          break;
        case "completed":
          backendStatus = "Đã hoàn thành";
          break;
        default:
          backendStatus = "Đã xác nhận";
      }

      const updateData = {
        StudentID: selectedSubmission.studentId,
        MedicineName: selectedSubmission.medicineName,
        Quantity: selectedSubmission.quantity,
        Dosage: selectedSubmission.dosage,
        Instructions: selectedSubmission.instructions,
        Status: backendStatus,
        Notes: values.progressNotes,
        SentDate: selectedSubmission.submissionDate,
        ParentID: selectedSubmission.parentId || null,
      };

      console.log("🚀 Update Progress - JSON Data gửi lên API:", updateData);
      console.log("📝 Form values từ modal:", values);
      console.log("🔄 Backend Status:", backendStatus);

      // Kiểm tra ID hợp lệ trước khi gọi API
      if (
        !selectedSubmission.id ||
        selectedSubmission.id.toString().startsWith("TEST_")
      ) {
        message.error("ID thuốc không hợp lệ! Không thể cập nhật test data.");
        return;
      }

      await medicineApi.nurse.update(selectedSubmission.id, updateData);
      fetchSubmissions();
      message.success("Cập nhật tiến độ sử dụng thuốc thành công!");
      setUpdateModalVisible(false);
    } catch (error) {
      console.error("Lỗi cập nhật tiến độ:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.status === 404) {
        message.error(
          "Không tìm thấy thuốc cần cập nhật! ID có thể không hợp lệ."
        );
      } else if (error.response?.status === 400) {
        // Hiển thị lỗi validation chi tiết
        const validationErrors =
          error.response?.data?.errors || error.response?.data?.message;
        if (validationErrors) {
          message.error(
            `Validation Error: ${JSON.stringify(validationErrors)}`
          );
        } else {
          message.error("Dữ liệu gửi lên không hợp lệ! Vui lòng kiểm tra lại.");
        }
      } else {
        message.error("Cập nhật tiến độ thất bại!");
      }
    }
  };

  // chỉnh sửa thuốc
  const handleEdit = (submission) => {
    setSelectedSubmission(submission);

    console.log("🔍 Handle Edit - Submission data:", submission);
    console.log("🔍 Available fields:", Object.keys(submission));
    console.log("🔍 quantity field:", submission.quantity);
    console.log("🔍 Quantity field:", submission.Quantity);

    editForm.setFieldsValue({
      medicineName: submission.medicationName || submission.medicineName,
      quantity: submission.quantity || submission.Quantity,
      dosage: submission.dosage,
      instructions: submission.instructions,
      urgency: submission.urgency || "normal",
      notes: submission.notes || "",
    });

    console.log("🔍 Form values set:", {
      medicineName: submission.medicationName || submission.medicineName,
      quantity: submission.quantity || submission.Quantity,
      dosage: submission.dosage,
      instructions: submission.instructions,
      urgency: submission.urgency || "normal",
      notes: submission.notes || "",
    });

    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      console.log(
        "🔍 DEBUG - selectedSubmission full object:",
        selectedSubmission
      );
      console.log("🔍 DEBUG - studentId value:", selectedSubmission.studentId);
      console.log(
        "🔍 DEBUG - Available fields:",
        Object.keys(selectedSubmission)
      );
      const studentID =
        selectedSubmission.studentId ||
        selectedSubmission.StudentID ||
        selectedSubmission.id;

      if (!studentID) {
        message.error("Thiếu thông tin StudentID! Không thể cập nhật thuốc.");
        console.error(
          "❌ Missing StudentID in selectedSubmission:",
          selectedSubmission
        );
        return;
      }

      // Map status từ frontend sang backend format
      let backendStatus;
      switch (selectedSubmission.status) {
        case "pending":
          backendStatus = "Chờ xử lý";
          break;
        case "approved":
          backendStatus = "Đã xác nhận";
          break;
        case "in-use":
          backendStatus = "Đang thực hiện";
          break;
        case "completed":
          backendStatus = "Đã hoàn thành";
          break;
        case "rejected":
          backendStatus = "Từ chối";
          break;
        default:
          backendStatus = "Chờ xử lý";
      }
      const updateData = {
        StudentID: studentID,
        MedicineName: values.medicineName,
        Quantity: values.quantity,
        Dosage: values.dosage,
        Instructions: values.instructions,
        Status: backendStatus,
        Notes: values.notes,
        SentDate: selectedSubmission.submissionDate,
        ParentID: selectedSubmission.parentId || null,
      };

      console.log("🚀 Edit Submit - JSON Data gửi lên API:", updateData);
      console.log("📝 Form values:", values);

      if (
        !selectedSubmission.id ||
        selectedSubmission.id.toString().startsWith("TEST_")
      ) {
        message.error("ID thuốc không hợp lệ! Không thể cập nhật test data.");
        return;
      }

      await medicineApi.nurse.update(selectedSubmission.id, updateData);
      fetchSubmissions();

      message.success("Cập nhật thông tin thuốc thành công!");
      setEditModalVisible(false);
    } catch (error) {
      console.error("❌ Lỗi cập nhật thuốc:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      if (error.code === "ECONNABORTED") {
        message.error("Kết nối tới server bị timeout! Vui lòng thử lại.");
      } else if (error.response?.status === 400) {
        const validationErrors =
          error.response?.data?.errors || error.response?.data?.message;
        if (validationErrors) {
          message.error(
            `Validation Error: ${JSON.stringify(validationErrors)}`
          );
        } else {
          message.error("Dữ liệu gửi lên không hợp lệ! Vui lòng kiểm tra lại.");
        }
      } else if (error.response?.status === 404) {
        message.error("Không tìm thấy thuốc cần cập nhật!");
      } else if (error.response?.status === 500) {
        message.error("Lỗi server! Vui lòng liên hệ admin.");
      } else if (!error.response) {
        message.error("Không thể kết nối tới server! Kiểm tra kết nối mạng.");
      } else {
        message.error("Cập nhật thuốc thất bại! Vui lòng thử lại.");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "green";
      case "in-use":
        return "blue";
      case "completed":
        return "cyan";
      case "rejected":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "approved":
        return "Đã xác nhận";
      case "in-use":
        return "Đang sử dụng";
      case "completed":
        return "Hoàn thành";
      case "rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  const classes = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B"];
  const statuses = ["pending", "approved", "in-use", "completed", "rejected"];

  // 🆕 Search medicine by Student ID
  const handleSearchByStudentId = async () => {
    if (!studentSearchText.trim()) {
      message.warning("Vui lòng nhập mã học sinh!");
      return;
    }

    setSearchLoading(true);
    try {
      const response = await medicineApi.nurse.getByStudentId(studentSearchText.trim());
      
      if (response.data && response.data.length > 0) {
        const mappedData = response.data.map((item) => ({
          id: item.medicineID,
          key: item.medicineID,
          submissionCode: item.medicineID,
          studentId: item.studentID,
          studentName: item.studentName || "Chưa có tên", 
          studentClass: item.className || "Chưa có lớp",
          medicationName: item.medicineName,
          dosage: item.dosage,
          frequency: "Chưa có",
          duration: "Chưa có", 
          instructions: item.instructions,
          reason: "Chưa có",
          quantity: item.quantity,
          status: getStatusFromBackend(item.status),
          submissionDate: item.sentDate,
          verifiedBy: item.nurseID || null,
          verifiedDate: null,
          verificationNotes: item.notes,
          urgencyLevel: "normal",
          medicationImages: item.image ? [item.image] : [],
          prescriptionImage: null,
          parentSignature: null,
          administrationTimes: [],
          createdBy: item.parentID ? "parent" : "nurse",
        }));

        setSubmissions(mappedData);
        message.success(`Tìm thấy ${mappedData.length} thuốc của học sinh ${studentSearchText}`);
      } else {
        setSubmissions([]);
        message.info(`Không tìm thấy thuốc nào của học sinh ${studentSearchText}`);
      }
    } catch (error) {
      console.error("❌ Lỗi search by StudentID:", error);
      if (error.response?.status === 404) {
        message.error("Không tìm thấy học sinh này!");
      } else {
        message.error("Lỗi tìm kiếm! Vui lòng thử lại.");
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // 🆕 Reset to show all medicines
  const handleShowAll = () => {
    setStudentSearchText("");
    fetchSubmissions();
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;
    const matchesClass =
      classFilter === "all" || submission.studentClass === classFilter;
    const matchesStudentId =
      studentSearchText === "" || submission.studentId.includes(studentSearchText);
    return matchesStatus && matchesClass && matchesStudentId;
  });

  const columns = [
    {
      title: "Mã yêu cầu",
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
      title: "Thuốc & Liều dùng",
      key: "medication",
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: "13px", color: "#722ed1" }}>
            {record.medicationName}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.dosage} - {record.frequency}
          </Text>
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
      title: "Ngày gửi",
      dataIndex: "submissionDate",
      key: "submissionDate",
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
          {record.status === "pending" && record.createdBy === "parent" && (
            <>
              <Button
                type="default"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(record)}
                style={{
                  padding: "0 6px",
                  fontSize: "12px",
                  marginRight: "4px",
                }}
              >
                Sửa
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handleVerify(record)}
                style={{ padding: "0 6px", fontSize: "12px" }}
              >
                Xử lý
              </Button>
            </>
          )}
          {(record.status === "approved" || record.status === "in-use") && (
            <Button
              type="default"
              icon={<ClockCircleOutlined />}
              size="small"
              onClick={() => handleUpdateProgress(record)}
              style={{ padding: "0 6px", fontSize: "12px" }}
            >
              Cập nhật
            </Button>
          )}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchSubmissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ 
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)", 
      minHeight: "100vh", 
      padding: "0"
    }}>
      {/* 🎨 Modern Enhanced Header with Navigation Feel */}
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
          borderRadius: "0 0 32px 32px",
          padding: "40px 32px 48px",
          marginBottom: "40px",
          boxShadow: "0 25px 50px rgba(79, 70, 229, 0.25), 0 0 0 1px rgba(255,255,255,0.1)",
          position: "relative",
          overflow: "hidden",
          border: "none"
        }}
      >
        {/* Enhanced Background decorations */}
        <div style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)",
          borderRadius: "50%",
          animation: "float 6s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 8s ease-in-out infinite reverse"
        }} />
        
        {/* Header Content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <Row align="middle" justify="space-between">
            <Col xs={24} md={16}>
              <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                {/* Logo/Icon Section */}
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #ff6b9d 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 15px 35px rgba(255, 107, 107, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)",
                    border: "2px solid rgba(255,255,255,0.2)"
                  }}
                >
                  <span style={{ 
                    fontSize: "36px",
                    filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))"
                  }}>
                    💊
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
                      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    Quản Lý Thuốc Y Tế
                  </Title>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#10b981",
                        boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.3)"
                      }}
                    />
                    <Text style={{ 
                      fontSize: "16px", 
                      color: "rgba(255,255,255,0.95)",
                      fontWeight: "500",
                      textShadow: "1px 1px 3px rgba(0,0,0,0.2)"
                    }}>
                      Hệ thống tiếp nhận và quản lý thuốc cho học sinh tiểu học
                    </Text>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={8} style={{ textAlign: "right", marginTop: { xs: "24px", md: "0" } }}>
              {/* Quick Stats in Header */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", flexWrap: "wrap" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "16px",
                    padding: "12px 16px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    textAlign: "center",
                    minWidth: "100px"
                  }}
                >
                  <div style={{ fontSize: "18px", marginBottom: "4px" }}>📊</div>
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "bold", 
                    color: "white",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
                  }}>
                    {submissions.length}
                  </div>
                  <Text style={{ 
                    fontSize: "12px", 
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: "500"
                  }}>
                    Tổng đơn
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
                    minWidth: "100px"
                  }}
                >
                  <div style={{ fontSize: "18px", marginBottom: "4px" }}>⏱️</div>
                  <div style={{ 
                    fontSize: "14px", 
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: "500"
                  }}>
                    {new Date().toLocaleDateString("vi-VN")}
                  </div>
                  <Text style={{ 
                    fontSize: "12px", 
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: "400"
                  }}>
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

        {/* 📊 Thống kê trạng thái đơn thuốc - ĐƯỢC DI CHUYỂN LÊN TRÊN ĐẦU */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
                border: "2px solid rgba(255,255,255,0.2)"
              }}
            >
              <Text style={{ color: "white", fontSize: "24px" }}>�</Text>
            </div>
            <div>
              <Text strong style={{ 
                fontSize: "18px", 
                color: "#1e293b",
                display: "block",
                marginBottom: "4px"
              }}>
                Thống kê trạng thái đơn thuốc
              </Text>
              <Text style={{ 
                fontSize: "14px", 
                color: "#64748b",
                fontWeight: "400"
              }}>
                Tổng quan về các đơn thuốc theo trạng thái xử lý
              </Text>
            </div>
          </div>
        }
        style={{
          marginBottom: "32px",
          borderRadius: "20px",
          border: "none",
          background: "white",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Row gutter={[20, 20]} justify="center">
          <Col xs={12} sm={8} md={4}>
            <Card 
              hoverable
              style={{ 
                borderRadius: "16px", 
                border: "none",
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                boxShadow: "0 10px 25px rgba(245, 158, 11, 0.2)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer"
              }}
              bodyStyle={{ padding: "20px" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(245, 158, 11, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(245, 158, 11, 0.2)";
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ 
                  fontSize: "40px",
                  marginBottom: "12px",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))"
                }}>
                  ⏳
                </div>
                <div style={{ 
                  fontSize: "28px", 
                  fontWeight: "800", 
                  color: "#d97706",
                  marginBottom: "6px",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                }}>
                  {submissions.filter((s) => s.status === "pending").length}
                </div>
                <Text style={{ 
                  fontSize: "13px", 
                  color: "#92400e",
                  fontWeight: "600"
                }}>
                  Chờ xử lý
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={12} sm={8} md={4}>
            <Card 
              hoverable
              style={{ 
                borderRadius: "16px", 
                border: "none",
                background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                boxShadow: "0 10px 25px rgba(34, 197, 94, 0.2)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer"
              }}
              bodyStyle={{ padding: "20px" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(34, 197, 94, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(34, 197, 94, 0.2)";
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ 
                  fontSize: "40px",
                  marginBottom: "12px",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))"
                }}>
                  ✅
                </div>
                <div style={{ 
                  fontSize: "28px", 
                  fontWeight: "800", 
                  color: "#16a34a",
                  marginBottom: "6px",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                }}>
                  {submissions.filter((s) => s.status === "approved").length}
                </div>
                <Text style={{ 
                  fontSize: "13px", 
                  color: "#15803d",
                  fontWeight: "600"
                }}>
                  Đã duyệt
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={12} sm={8} md={4}>
            <Card 
              hoverable
              style={{ 
                borderRadius: "16px", 
                border: "none",
                background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer"
              }}
              bodyStyle={{ padding: "20px" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(59, 130, 246, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(59, 130, 246, 0.2)";
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ 
                  fontSize: "40px",
                  marginBottom: "12px",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))"
                }}>
                  💊
                </div>
                <div style={{ 
                  fontSize: "28px", 
                  fontWeight: "800", 
                  color: "#2563eb",
                  marginBottom: "6px",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                }}>
                  {submissions.filter((s) => s.status === "in-use").length}
                </div>
                <Text style={{ 
                  fontSize: "13px", 
                  color: "#1d4ed8",
                  fontWeight: "600"
                }}>
                  Đang sử dụng
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={12} sm={8} md={4}>
            <Card 
              hoverable
              style={{ 
                borderRadius: "16px", 
                border: "none",
                background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                boxShadow: "0 10px 25px rgba(124, 58, 237, 0.2)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer"
              }}
              bodyStyle={{ padding: "20px" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(124, 58, 237, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(124, 58, 237, 0.2)";
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ 
                  fontSize: "40px",
                  marginBottom: "12px",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))"
                }}>
                  🎯
                </div>
                <div style={{ 
                  fontSize: "28px", 
                  fontWeight: "800", 
                  color: "#7c3aed",
                  marginBottom: "6px",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                }}>
                  {submissions.filter((s) => s.status === "completed").length}
                </div>
                <Text style={{ 
                  fontSize: "13px", 
                  color: "#6d28d9",
                  fontWeight: "600"
                }}>
                  Hoàn thành
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={12} sm={8} md={4}>
            <Card 
              hoverable
              style={{ 
                borderRadius: "16px", 
                border: "none",
                background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                boxShadow: "0 10px 25px rgba(239, 68, 68, 0.2)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer"
              }}
              bodyStyle={{ padding: "20px" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(239, 68, 68, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(239, 68, 68, 0.2)";
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ 
                  fontSize: "40px",
                  marginBottom: "12px",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))"
                }}>
                  ❌
                </div>
                <div style={{ 
                  fontSize: "28px", 
                  fontWeight: "800", 
                  color: "#dc2626",
                  marginBottom: "6px",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                }}>
                  {submissions.filter((s) => s.status === "rejected").length}
                </div>
                <Text style={{ 
                  fontSize: "13px", 
                  color: "#b91c1c",
                  fontWeight: "600"
                }}>
                  Từ chối
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 🎯 Bộ lọc và tìm kiếm - ĐƯỢC DI CHUYỂN XUỐNG DƯỚI THỐNG KÊ */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)",
                border: "2px solid rgba(255,255,255,0.2)"
              }}
            >
              <Text style={{ color: "white", fontSize: "24px" }}>🔍</Text>
            </div>
            <div>
              <Text strong style={{ 
                fontSize: "18px", 
                color: "#1e293b",
                display: "block",
                marginBottom: "4px"
              }}>
                Bộ lọc và tìm kiếm
              </Text>
              <Text style={{ 
                fontSize: "14px", 
                color: "#64748b",
                fontWeight: "400"
              }}>
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
          boxShadow: "0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <div style={{ 
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", 
          padding: "16px 20px", 
          borderRadius: "16px", 
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}>
          <Row gutter={[12, 12]} align="middle">
            {/* Trạng thái - Compact */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <div style={{ marginBottom: "6px" }}>
                <Text strong style={{ 
                  fontSize: "13px", 
                  color: "#1e40af",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  🎯 <span>Trạng thái</span>
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
                  <span style={{ fontSize: "13px", color: "#666" }}>📋 Tất cả</span>
                </Option>
                {statuses.map((status) => (
                  <Option key={status} value={status}>
                    <span style={{ fontSize: "13px" }}>
                      {status === "pending" ? "⏳ Chờ xử lý" : 
                       status === "approved" ? "✅ Đã duyệt" :
                       status === "in-use" ? "💊 Đang dùng" :
                       status === "completed" ? "🎯 Hoàn thành" :
                       status === "rejected" ? "❌ Từ chối" : "📋"}
                    </span>
                  </Option>
                ))}
              </Select>
            </Col>
            
            {/* Lớp học - Compact */}
            <Col xs={24} sm={12} md={8} lg={5}>
              <div style={{ marginBottom: "6px" }}>
                <Text strong style={{ 
                  fontSize: "13px", 
                  color: "#7c2d12",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  🏫 <span>Lớp</span>
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
                  <span style={{ fontSize: "13px", color: "#666" }}>🎓 Tất cả</span>
                </Option>
                {classes.map((cls) => (
                  <Option key={cls} value={cls}>
                    <span style={{ fontSize: "13px" }}>📚 Lớp {cls}</span>
                  </Option>
                ))}
              </Select>
            </Col>
            
            {/* Tìm kiếm học sinh - Compact và không bị xuống hàng */}
            <Col xs={24} sm={24} md={8} lg={8}>
              <div style={{ marginBottom: "6px" }}>
                <Text strong style={{ 
                  fontSize: "13px", 
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  👤 <span>Tìm kiếm theo mã học sinh</span>
                </Text>
              </div>
              <Input.Group compact style={{ display: "flex", width: "100%" }}>
                <Input
                  placeholder="Nhập mã học sinh..."
                  value={studentSearchText}
                  onChange={(e) => setStudentSearchText(e.target.value)}
                  onPressEnter={handleSearchByStudentId}
                  style={{ 
                    flex: 1,
                    borderRadius: "8px 0 0 8px",
                    fontSize: "13px",
                    borderRight: "none",
                    minWidth: 0 // Cho phép thu nhỏ khi cần
                  }}
                  size="middle"
                  prefix={<UserOutlined style={{ color: "#dc2626", fontSize: "12px" }} />}
                />
                <Button 
                  type="primary" 
                  onClick={handleSearchByStudentId}
                  loading={searchLoading}
                  style={{ 
                    width: "44px",
                    minWidth: "44px",
                    borderRadius: "0",
                    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                    borderColor: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
                    transition: "all 0.2s ease"
                  }}
                  size="middle"
                  title="Tìm kiếm"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(220, 38, 38, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(220, 38, 38, 0.2)";
                  }}
                >
                  🔍
                </Button>
                <Button 
                  onClick={handleShowAll}
                  style={{ 
                    width: "44px",
                    minWidth: "44px",
                    borderRadius: "0 8px 8px 0",
                    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                    borderColor: "#e2e8f0",
                    borderLeft: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    transition: "all 0.2s ease"
                  }}
                  size="middle"
                  title="Hiển thị tất cả"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.background = "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)";
                  }}
                >
                  📋
                </Button>
              </Input.Group>
            </Col>
            
            {/* Thời gian cập nhật - Compact */}
            <Col xs={24} sm={24} md={24} lg={5}>
              <div style={{ 
                display: "flex", 
                justifyContent: { xs: "center", lg: "flex-end" },
                alignItems: "center",
                height: "100%"
              }}>
                <div
                  style={{
                    padding: "10px 16px",
                    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                    borderRadius: "12px",
                    border: "1px solid #bfdbfe",
                    textAlign: "center",
                    boxShadow: "0 3px 8px rgba(59, 130, 246, 0.12)",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    minWidth: "130px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 3px 8px rgba(59, 130, 246, 0.12)";
                  }}
                >
                  <div style={{ fontSize: "16px", marginBottom: "4px" }}>🕒</div>
                  <Text style={{ 
                    color: "#1e40af", 
                    fontSize: "11px", 
                    fontWeight: "600",
                    display: "block"
                  }}>
                    Cập nhật lúc
                  </Text>
                  <div style={{ 
                    fontSize: "10px", 
                    color: "#64748b", 
                    marginTop: "2px",
                    fontWeight: "500"
                  }}>
                    {new Date().toLocaleTimeString("vi-VN")}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* 📋 Data Table Section */}
      <Card
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <Text strong style={{ fontSize: "16px", color: "#333" }}>
                Danh sách yêu cầu thuốc
              </Text>
              <div
                style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}
              >
                Tổng cộng: <strong>{filteredSubmissions.length}</strong> yêu cầu
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
                style={{
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                  borderColor: "#52c41a",
                  boxShadow: "0 4px 12px rgba(82, 196, 26, 0.3)",
                  fontWeight: "600"
                }}
                size="middle"
              >
                Thêm đơn thuốc mới
              </Button>
              <div
                style={{
                  background: "#f0f9ff",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d1ecf1",
                }}
              >
                <Text style={{ color: "#1890ff", fontSize: "12px" }}>
                  Cập nhật: {new Date().toLocaleTimeString("vi-VN")}
                </Text>
              </div>
            </div>
          </div>
        }
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #e8e8e8",
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredSubmissions}
          loading={loading}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} yêu cầu`,
          }}
        />
      </Card>

      {/* Modal Xử lý */}
      <Modal
        title="Xử Lý Yêu Cầu Thuốc"
        open={verifyModalVisible}
        onCancel={() => setVerifyModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedSubmission && (
          <div style={{ marginBottom: "16px" }}>
            <Card
              size="small"
              style={{
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: "6px",
              }}
            >
              <Row gutter={12}>
                <Col span={12}>
                  <Text strong style={{ color: "#666", fontSize: "12px" }}>
                    Học sinh:
                  </Text>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    {selectedSubmission.studentName}
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong style={{ color: "#666", fontSize: "12px" }}>
                    Thuốc:
                  </Text>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#722ed1",
                    }}
                  >
                    {selectedSubmission.medicationName}
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleVerifySubmit}>
          <Form.Item
            name="status"
            label={<Text strong>Quyết định xử lý</Text>}
            rules={[{ required: true, message: "Vui lòng chọn quyết định!" }]}
          >
            <Select
              placeholder="Chọn quyết định"
              style={{ borderRadius: "6px" }}
            >
              <Option value="approved">
                <CheckOutlined
                  style={{ color: "#52c41a", marginRight: "6px" }}
                />
                Phê duyệt yêu cầu
              </Option>
              <Option value="rejected">
                <CloseOutlined
                  style={{ color: "#ff4d4f", marginRight: "6px" }}
                />
                Từ chối yêu cầu
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="verificationNotes"
            label={<Text strong>Ghi chú</Text>}
            rules={[{ required: true, message: "Vui lòng nhập ghi chú!" }]}
          >
            <TextArea
              rows={3}
              placeholder="Nhập ghi chú về việc kiểm tra thuốc, lý do phê duyệt/từ chối..."
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: "20px" }}>
            <Space>
              <Button
                onClick={() => setVerifyModalVisible(false)}
                style={{ borderRadius: "6px" }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  borderRadius: "6px",
                  background: "#52c41a",
                  borderColor: "#52c41a",
                }}
              >
                <CheckOutlined />
                Xác nhận
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Chi tiết */}
      <Modal
        title="Chi Tiết Yêu Cầu Thuốc"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button
            key="close"
            size="large"
            onClick={() => setDetailModalVisible(false)}
          >
            <CloseOutlined />
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedSubmission && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ fontSize: "16px" }}>
                Thông tin thuốc: {selectedSubmission.medicationName}
              </Text>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Text>Học sinh: {selectedSubmission.studentName}</Text>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Text>Liều dùng: {selectedSubmission.dosage}</Text>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Text>Hướng dẫn: {selectedSubmission.instructions}</Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Thêm thuốc */}
      <Modal
        title="Thêm Thuốc Mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateMedicine}
        >
          <Row gutter={[20, 16]}>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="Mã học sinh"
                rules={[
                  { required: true, message: "Vui lòng nhập mã học sinh!" },
                ]}
              >
                <Input
                  placeholder="VD: ST0007"
                  size="large"
                  prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                />
              </Form.Item>
              <Form.Item
                name="dosage"
                label="Liều dùng"
                rules={[
                  { required: true, message: "Vui lòng nhập liều dùng!" },
                ]}
              >
                <Input placeholder="VD: 1 viên/lần" size="large" />
              </Form.Item>
              <Form.Item
                name="instructions"
                label="Hướng dẫn sử dụng"
                rules={[
                  { required: true, message: "Vui lòng nhập hướng dẫn!" },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="VD: Uống sau bữa ăn 30 phút..."
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="medicineName"
                label="Tên thuốc"
                rules={[
                  { required: true, message: "Vui lòng nhập tên thuốc!" },
                ]}
              >
                <Input placeholder="VD: Paracetamol 500mg" size="large" />
              </Form.Item>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <Input placeholder="VD: 10 viên" size="large" />
              </Form.Item>
              <Form.Item name="frequency" label="Tần suất">
                <Select placeholder="Chọn tần suất" size="large">
                  <Option value="1 lần/ngày">1 lần/ngày</Option>
                  <Option value="2 lần/ngày">2 lần/ngày</Option>
                  <Option value="3 lần/ngày">3 lần/ngày</Option>
                  <Option value="Khi cần">Khi cần thiết</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div
            style={{
              textAlign: "center",
              paddingTop: "16px",
              borderTop: "1px solid #f0f0f0",
              marginTop: "16px",
            }}
          >
            <Space size="large">
              <Button
                size="large"
                onClick={() => {
                  setCreateModalVisible(false);
                  createForm.resetFields();
                }}
                style={{ minWidth: "120px", borderRadius: "8px" }}
              >
                <CloseOutlined />
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{ minWidth: "120px", borderRadius: "8px" }}
              >
                <CheckOutlined />
                Thêm thuốc
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Cập nhật tiến độ */}
      <Modal
        title="Cập Nhật Tiến Độ Sử Dụng Thuốc"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedSubmission && (
          <div style={{ marginBottom: "16px" }}>
            <Card
              size="small"
              style={{
                background: "#e6f7ff",
                border: "1px solid #91d5ff",
                borderRadius: "6px",
              }}
            >
              <Row gutter={12}>
                <Col span={12}>
                  <Text strong style={{ color: "#666", fontSize: "12px" }}>
                    Học sinh:
                  </Text>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    {selectedSubmission.studentName}
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong style={{ color: "#666", fontSize: "12px" }}>
                    Thuốc:
                  </Text>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#722ed1",
                    }}
                  >
                    {selectedSubmission.medicationName}
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}

        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateProgressSubmit}
        >
          <Form.Item
            name="currentStatus"
            label={<Text strong>Trạng thái hiện tại</Text>}
          >
            <Select disabled style={{ borderRadius: "6px" }}>
              <Option value="approved">Đã xác nhận</Option>
              <Option value="in-use">Đang sử dụng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="newStatus"
            label={<Text strong>Cập nhật trạng thái</Text>}
            rules={[
              { required: true, message: "Vui lòng chọn trạng thái mới!" },
            ]}
          >
            <Select
              placeholder="Chọn trạng thái mới"
              style={{ borderRadius: "6px" }}
            >
              <Option value="in-use">
                <ClockCircleOutlined
                  style={{ color: "#1890ff", marginRight: "6px" }}
                />
                Đang sử dụng (học sinh bắt đầu uống thuốc)
              </Option>
              <Option value="completed">
                <CheckOutlined
                  style={{ color: "#52c41a", marginRight: "6px" }}
                />
                Hoàn thành (đã uống hết thuốc)
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="administrationTime"
            label={<Text strong>Thời gian cập nhật</Text>}
            rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn thời gian cập nhật"
              style={{ width: "100%", borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="progressNotes"
            label={<Text strong>Ghi chú tiến độ</Text>}
            rules={[{ required: true, message: "Vui lòng nhập ghi chú!" }]}
          >
            <TextArea
              rows={3}
              placeholder="VD: Học sinh đã bắt đầu uống thuốc, phản ứng tốt..."
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: "20px" }}>
            <Space>
              <Button
                onClick={() => setUpdateModalVisible(false)}
                style={{ borderRadius: "6px" }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  borderRadius: "6px",
                  background: "#1890ff",
                  borderColor: "#1890ff",
                }}
              >
                <CheckOutlined />
                Cập nhật tiến độ
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Chỉnh sửa thuốc */}
      <Modal
        title="Chỉnh Sửa Thông Tin Thuốc"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedSubmission && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
            style={{ marginTop: "16px" }}
          >
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#f9f9f9",
                borderRadius: "6px",
              }}
            >
              <Text strong>Thông tin học sinh:</Text>
              <div style={{ marginTop: "4px" }}>
                <Text>
                  {selectedSubmission.studentName} - Lớp{" "}
                  {selectedSubmission.studentClass}
                </Text>
              </div>
            </div>

            <Form.Item
              label="Tên thuốc"
              name="medicineName"
              rules={[{ required: true, message: "Vui lòng nhập tên thuốc!" }]}
            >
              <Input placeholder="Nhập tên thuốc" />
            </Form.Item>

            <Form.Item
              label="Số lượng"
              name="quantity"
              rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
            >
              <Input type="number" placeholder="Nhập số lượng" />
            </Form.Item>

            <Form.Item
              label="Liều dùng"
              name="dosage"
              rules={[{ required: true, message: "Vui lòng nhập liều dùng!" }]}
            >
              <Input placeholder="Ví dụ: 1 viên, 2 muỗng canh" />
            </Form.Item>

            <Form.Item
              label="Hướng dẫn sử dụng"
              name="instructions"
              rules={[{ required: true, message: "Vui lòng nhập hướng dẫn!" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Nhập hướng dẫn chi tiết về cách sử dụng thuốc"
              />
            </Form.Item>

            <Form.Item label="Mức độ khẩn cấp" name="urgency">
              <Select placeholder="Chọn mức độ khẩn cấp">
                <Option value="high">Khẩn cấp</Option>
                <Option value="normal">Bình thường</Option>
                <Option value="low">Không khẩn</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Ghi chú thêm" name="notes">
              <Input.TextArea
                rows={2}
                placeholder="Ghi chú bổ sung (không bắt buộc)"
              />
            </Form.Item>

            <div style={{ textAlign: "right", marginTop: "24px" }}>
              <Space>
                <Button onClick={() => setEditModalVisible(false)}>
                  Hủy bỏ
                </Button>
                <Button type="primary" htmlType="submit">
                  Lưu thay đổi
                </Button>
              </Space>
            </div>
          </Form>
        )}
      </Modal>
      
      </div> {/* Close main content container */}
    </div>
  );
}

export default MedicationSubmission;
