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
  Upload,
  Descriptions,
  Divider,
  Tabs,
  Radio,
} from "antd";
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ExperimentOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import vaccineApi from "../../api/vaccineApi";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function VaccinationManagement() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [searchText, setSearchText] = useState(""); // 🆕 Search text for multi-field search
  const [activeTab, setActiveTab] = useState("waiting-confirmation"); // 🆕 Tab state: waiting-confirmation, vaccination, post-vaccination

  // modal thêm vaccine
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  // modal cập nhật tiến độ tiêm chủng
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateForm] = Form.useForm();

  // modal chỉnh sửa vaccine
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  // API fetch data từ vaccine endpoint thật
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching vaccine data...");

      const response = await vaccineApi.nurse.getAll();

      console.log("🦠 Total items from API:", response.data.length);

      // Map dataBE
      const mappedData = response.data.map((item) => {
        // Map dataBE
        let status = "pending";
        if (item.status) {
          const backendStatus = item.status.trim();
          console.log(
            `📊 Backend status: "${backendStatus}" → Frontend status mapping...`
          );

          switch (backendStatus) {
            case "Đã chấp nhận":
            case "Đã xác nhận":
              status = "confirmed";
              break;
            case "Chờ tiêm":
              status = "approved";
              break;
            case "Đã tiêm":
            case "Đã tiêm xong":
            case "Hoàn tất tiêm":
              status = "injected";
              break;
            case "Đang tiêm":
              status = "injected";
              break;
            case "Đang theo dõi":
            case "Theo dõi":
              status = "monitoring";
              break;
            case "Từ chối":
            case "Đã từ chối":
              status = "rejected";
              break;
            case "Hoàn thành":
            case "Hoàn tất":
              status = "completed";
              break;
            case "Chờ xác nhận":
            case "Chờ phản hồi":
              status = "pending";
              break;
            default:
              console.warn(
                `⚠️ Unknown backend status: "${backendStatus}", defaulting to pending`
              );
              status = "pending";
          }

          console.log(`✅ "${backendStatus}" → "${status}"`);
        } else {
          console.log(
            `⚠️ No status found for record ${item.recordID}, defaulting to pending`
          );
        }

        return {
          id: item.recordID,
          key: item.recordID,
          submissionCode: item.recordID,
          studentId: item.studentID,
          studentName: item.studentName,
          studentClass: item.class,
          classId: item.classID || 4,

          // Vaccine specific fields
          vaccineName: item.vaccineName,
          vaccinationType: item.dose,
          scheduledDate: dayjs(item.dateTime).format("DD/MM/YYYY"),
          actualDate: item.vaccinatedAt
            ? dayjs(item.vaccinatedAt).format("DD/MM/YYYY")
            : null,
          administrationNotes: item.notes || "Chưa có ghi chú",
          reaction: "",
          location: "Phòng y tế",
          nurseId: item.nurseID,
          dose: item.dose,
          vaccineID: item.vaccineID,
          vaccinatorID: item.vaccinatorID,

          // Follow up fields
          followUpNotes: item.followUpNotes,
          followUpDate: item.followUpDate,

          // UI display fields
          status: status,
          submissionDate: item.dateTime,
          verifiedBy: item.nurseID || null,
          verifiedDate: item.vaccinatedAt,
          verificationNotes: item.notes,
          urgencyLevel: "normal",

          // Metadata
          createdBy: "nurse",
        };
      });

      console.log("✅ Mapped vaccine data:", mappedData);
      setSubmissions(mappedData);
    } catch (error) {
      console.error("❌ Lỗi fetch vaccine API:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 403) {
        message.error("Bạn không có quyền truy cập chức năng này.");
      } else if (error.response?.status === 404) {
        message.error("Không tìm thấy dữ liệu vaccine.");
      } else {
        message.error("Không thể tải danh sách vaccine. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setDetailModalVisible(true);
  };

  // Tạo mới vaccine - sử dụng vaccineApi
  const handleCreateVaccine = async (values) => {
    try {
      // Tạo data theo format vaccineApi
      const createData = {
        VaccineID: values.vaccineId || "1",
        Dose: values.dose || "1",
        Notes: values.administrationNotes || "",
        // Sử dụng thời gian hiện tại thay vì scheduledDate
        VaccinatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };

      console.log("🚀 Create Type:", values.createType);
      console.log("🚀 Data gửi lên API:", createData);

      console.log("📝 Form values:", values);

      // Chọn API endpoint dựa trên loại tạo
      if (values.createType === "student") {
        // Tạo cho 1 học sinh
        createData.StudentID = values.studentId;
        await vaccineApi.nurse.createByStudentID(createData);
        message.success(
          `Tạo yêu cầu tiêm chủng cho học sinh ${values.studentId} thành công!`
        );
      } else {
        // Tạo cho cả lớp
        createData.ClassID = values.classId;
        await vaccineApi.nurse.createByClassID(createData);
        message.success(
          `Tạo yêu cầu tiêm chủng cho lớp ${values.classId} thành công!`
        );
      }

      setCreateModalVisible(false);
      createForm.resetFields();
      fetchSubmissions();
    } catch (error) {
      console.error("Lỗi tạo vaccine:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message || "Dữ liệu không hợp lệ";
        message.error(`Lỗi: ${errorMessage}`);
      } else if (error.response?.status === 404) {
        message.error(
          values.createType === "student"
            ? "Student ID không tồn tại! Vui lòng kiểm tra lại."
            : "Class ID không tồn tại! Vui lòng kiểm tra lại."
        );
      } else if (error.response?.status === 500) {
        message.error("Lỗi server. Vui lòng thử lại sau.");
      } else {
        message.error("Thêm vaccine thất bại!");
      }
    }
  };

  const handleUpdateProgress = (submission) => {
    setSelectedSubmission(submission);

    let nextStatus = "completed";
    if (submission.status === "confirmed") {
      nextStatus = "approved"; // Đã xác nhận → Chờ tiêm
    } else if (submission.status === "approved") {
      nextStatus = "injected"; // Chờ tiêm → Đã tiêm
    } else if (submission.status === "injected") {
      nextStatus = "monitoring"; // Đã tiêm → Đang theo dõi
    } else if (submission.status === "monitoring") {
      nextStatus = "completed"; // Đang theo dõi → Hoàn thành
    }

    updateForm.setFieldsValue({
      currentStatus: submission.status,
      newStatus: nextStatus,
      progressNotes: "",
      administrationTime: dayjs(),
    });
    setUpdateModalVisible(true);
  };

  const handleUpdateProgressSubmit = async (values) => {
    try {
      let backendStatus;
      switch (values.newStatus) {
        case "approved":
          backendStatus = "Chờ tiêm";
          break;
        case "injected":
          backendStatus = "Đã tiêm";
          break;
        case "monitoring":
          backendStatus = "Đang theo dõi";
          break;
        case "completed":
          backendStatus = "Hoàn thành";
          break;
        default:
          backendStatus = "Chờ tiêm";
      }

      if (
        !selectedSubmission.id ||
        selectedSubmission.id.toString().startsWith("TEST_")
      ) {
        message.error("ID vaccine không hợp lệ! Không thể cập nhật test data.");
        return;
      }

      if (
        ["confirmed", "approved"].includes(selectedSubmission.status) &&
        values.newStatus === "injected"
      ) {
        // confirmed/approved → injected: Nút "Thực hiện tiêm" - Dùng updateAfterByRecordID

        const updateData = {
          DateTime: values.administrationTime
            ? dayjs(values.administrationTime).format("YYYY-MM-DD HH:mm:ss")
            : dayjs().format("YYYY-MM-DD HH:mm:ss"),
          Status: backendStatus, // "Đã tiêm"
          FollowUpNotes: values.progressNotes || "",
          FollowUpDate: "", // Trống vì chưa hoàn thành
          StudentID: selectedSubmission.studentId,
        };

        console.log(
          "🚀 Thực hiện tiêm (approved→injected) - updateAfterByRecordID format chuẩn:",
          updateData
        );
        console.log("📝 Form values:", values);
        console.log("🆔 Record ID:", selectedSubmission.id);
        console.log("🔄 Expected status change: approved → injected");
        console.log("📅 Administration time:", values.administrationTime);
        console.log("🏥 Backend status to send:", backendStatus);

        const updateResponse = await vaccineApi.nurse.updateAfterByRecordID(
          selectedSubmission.id,
          updateData
        );
        console.log("✅ Injection Update Response:", updateResponse);
        console.log("✅ Update Response Data:", updateResponse.data);

        // Kiểm tra response để xem backend có trả về status mới không
        if (updateResponse.data) {
          console.log("📋 Response status:", updateResponse.data.status);
          console.log("📋 Response message:", updateResponse.data.message);
        }

        // Log để debug trạng thái
        console.log(
          "🔄 Status transition:",
          selectedSubmission.status,
          "→",
          values.newStatus
        );
        console.log("🎯 Expected backend status:", backendStatus);
      } else if (
        ["injected", "monitoring"].includes(selectedSubmission.status)
      ) {
        // injected → monitoring, monitoring → completed: Dùng updateAfterByRecordID
        const updateAfterData = {
          DateTime: values.administrationTime
            ? dayjs(values.administrationTime).format("YYYY-MM-DD HH:mm:ss")
            : dayjs().format("YYYY-MM-DD HH:mm:ss"),
          Status: backendStatus,
          FollowUpNotes: values.progressNotes || "",
          FollowUpDate:
            values.newStatus === "completed"
              ? dayjs().format("YYYY-MM-DD HH:mm:ss")
              : "",
          StudentID: selectedSubmission.studentId,
        };

        console.log(
          "🚀 Update Progress (updateAfterByRecordID) - Data gửi lên API:",
          updateAfterData
        );

        const updateAfterResponse =
          await vaccineApi.nurse.updateAfterByRecordID(
            selectedSubmission.id,
            updateAfterData
          );
        console.log("✅ UpdateAfter Response:", updateAfterResponse);
        console.log("✅ UpdateAfter Response Data:", updateAfterResponse.data);
      } else {
        // Fallback case cho các trường hợp khác
        console.log(
          "🔄 Fallback case - Status transition:",
          selectedSubmission.status,
          "→",
          values.newStatus
        );

        // Lấy nurseID (vaccinatorID) từ localStorage hoặc data
        let nurseID;
        try {
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          nurseID =
            currentUser.userID ||
            currentUser.id ||
            currentUser.userId ||
            selectedSubmission.nurseID ||
            selectedSubmission.nurseid ||
            selectedSubmission.nurseId ||
            selectedSubmission.verifiedBy ||
            "U0004"; // Default nurse ID

          console.log("👤 NurseID (VaccinatorID) for fallback:", nurseID);
        } catch (e) {
          nurseID = "U0004"; // Fallback
          console.log("⚠️ Using fallback NurseID:", nurseID);
        }

        // Quyết định API endpoint dựa trên workflow
        const isConfirmationWorkflow =
          selectedSubmission.status === "pending" &&
          (values.newStatus === "confirmed" || values.newStatus === "rejected");

        if (isConfirmationWorkflow) {
          // Tab "Chờ xác nhận": pending → confirmed/rejected - Dùng updateByRecordID
          const updateData = {
            dose: parseInt(selectedSubmission.dose) || 1,
            vaccineId: parseInt(selectedSubmission.vaccineID) || 1,
            vaccinatedAt: values.administrationTime
              ? dayjs(values.administrationTime).format("YYYY-MM-DD")
              : dayjs().format("YYYY-MM-DD"),
            vaccinatorID: nurseID,
            notes: values.progressNotes || "",
          };

          console.log(
            "🚀 Fallback updateByRecordID (Confirmation) - Data:",
            updateData
          );

          const fallbackResponse = await vaccineApi.nurse.updateByRecordID(
            selectedSubmission.id,
            updateData
          );
          console.log(
            "✅ Fallback updateByRecordID Response:",
            fallbackResponse
          );
        } else {
          // Tất cả các thao tác khác - Dùng updateAfterByRecordID
          const updateData = {
            dose: parseInt(selectedSubmission.dose) || 1,
            vaccineId: parseInt(selectedSubmission.vaccineID) || 1,
            vaccinatedAt: values.administrationTime
              ? dayjs(values.administrationTime).format("YYYY-MM-DD")
              : dayjs().format("YYYY-MM-DD"),
            vaccinatorID: nurseID,
            notes: values.progressNotes || "",
          };

          console.log(
            "🚀 Fallback updateAfterByRecordID (Other) - Data:",
            updateData
          );

          const fallbackResponse = await vaccineApi.nurse.updateAfterByRecordID(
            selectedSubmission.id,
            updateData
          );
          console.log(
            "✅ Fallback updateAfterByRecordID Response:",
            fallbackResponse
          );
        }
      }

      console.log("🔄 Bắt đầu fetch lại dữ liệu sau khi update...");

      setTimeout(async () => {
        await fetchSubmissions();
        console.log("✅ Hoàn thành fetch dữ liệu mới với delay");
      }, 500);

      message.success("Cập nhật tiến độ tiêm chủng thành công!");
      setUpdateModalVisible(false);
      updateForm.resetFields();
    } catch (error) {
      console.error("Lỗi cập nhật tiến độ:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.status === 404) {
        message.error(
          "Không tìm thấy vaccine cần cập nhật! ID có thể không hợp lệ."
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

  const handleEdit = (submission) => {
    setSelectedSubmission(submission);

    editForm.setFieldsValue({
      vaccineId: submission.vaccineID || submission.vaccineId || "1", // ID vaccine
      dose:
        submission.dose ||
        submission.vaccinationType ||
        submission.dosage ||
        "1", // Số liều
      vaccinatedAt:
        submission.vaccinatedAt || submission.scheduledDate
          ? dayjs(submission.vaccinatedAt || submission.scheduledDate)
          : dayjs(), // Ngày tiêm
      notes:
        submission.notes ||
        submission.administrationNotes ||
        submission.instructions ||
        "", // Ghi chú
    });

    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      let nurseID =
        selectedSubmission.nurseID ||
        selectedSubmission.nurseid ||
        selectedSubmission.nurseId ||
        selectedSubmission.verifiedBy;

      console.log("👤 Selected submission data:", selectedSubmission);
      console.log("🆔 NurseID extracted from data:", nurseID);

      if (!nurseID) {
        message.error("Thiếu thông tin NurseID! Không thể cập nhật vaccine.");
        console.error(
          "❌ Missing NurseID in selectedSubmission:",
          selectedSubmission
        );
        return;
      }

      // Kiểm tra format nurseID hợp lệ
      if (!nurseID || (typeof nurseID === "string" && nurseID.trim() === "")) {
        message.error("NurseID không hợp lệ! Hiện tại: " + nurseID);
        console.error("❌ Invalid NurseID:", nurseID);
        return;
      }

      // Kiểm tra ID hợp lệ
      if (
        !selectedSubmission.id ||
        selectedSubmission.id.toString().startsWith("TEST_")
      ) {
        message.error("ID vaccine không hợp lệ! Không thể cập nhật test data.");
        return;
      }

      const updateData = {
        dose: parseInt(values.dose) || parseInt(selectedSubmission.dose) || 1, // Number - từ form hoặc data hiện tại
        vaccineId:
          parseInt(values.vaccineId) ||
          parseInt(selectedSubmission.vaccineID) ||
          1, // Number - từ form hoặc data hiện tại
        vaccinatedAt: values.vaccinatedAt
          ? dayjs(values.vaccinatedAt).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"), // String YYYY-MM-DD - bắt buộc
        vaccinatorID: nurseID, // String NurseID - giữ nguyên format "U0004"
        notes: values.notes || "", // String - tùy chọn
      };

      console.log(
        "🚀 Edit Submit - Data gửi lên API (CHỈ CÁC TRƯỜNG CẦN THIẾT):",
        updateData
      );
      console.log("📝 Form values nhận được:", values);
      console.log("👤 NurseID (VaccinatorID) as string:", nurseID);
      console.log("🆔 Record ID để update:", selectedSubmission.id);

      await vaccineApi.nurse.updateByRecordID(
        selectedSubmission.id,
        updateData
      );
      fetchSubmissions();

      message.success("Cập nhật thông tin vaccine thành công!");
      setEditModalVisible(false);
    } catch (error) {
      console.error("❌ Lỗi cập nhật vaccine:", error);
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
        message.error("Không tìm thấy vaccine cần cập nhật!");
      } else if (error.response?.status === 500) {
        message.error("Lỗi server! Vui lòng liên hệ admin.");
      } else if (!error.response) {
        message.error("Không thể kết nối tới server! Kiểm tra kết nối mạng.");
      } else {
        message.error("Cập nhật vaccine thất bại! Vui lòng thử lại.");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange"; // Chờ phản hồi parent
      case "confirmed":
        return "blue"; // Đã chấp nhận/xác nhận
      case "approved":
        return "cyan"; // Chờ tiêm
      case "injected":
        return "green"; // Đã tiêm xong
      case "monitoring":
        return "purple"; // Đang theo dõi sau tiêm
      case "completed":
        return "success"; // Hoàn thành toàn bộ quy trình
      case "rejected":
        return "red"; // Parent từ chối
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ phản hồi";
      case "confirmed":
        return "Đã chấp nhận";
      case "approved":
        return "Chờ tiêm";
      case "injected":
        return "Đã tiêm";
      case "monitoring":
        return "Đang theo dõi";
      case "completed":
        return "Hoàn thành";
      case "rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  const classes = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B"];
  const statuses = [
    "pending",
    "confirmed",
    "approved",
    "injected",
    "monitoring",
    "completed",
    "rejected",
  ];

  // 🆕 Handle search function
  const handleSearch = () => {
    // Search is handled in filteredSubmissions filter logic
    console.log("🔍 Searching for:", searchText);
  };

  // Updated filter logic with 3 tabs
  const filteredSubmissions = submissions.filter((submission) => {
    // Tab filtering first
    let matchesTab = false;
    if (activeTab === "waiting-confirmation") {
      // Tab 1: Chờ xác nhận (pending, confirmed, rejected)
      matchesTab = ["pending", "confirmed", "rejected"].includes(
        submission.status
      );
    } else if (activeTab === "vaccination") {
      // Tab 2: Tiêm chủng (approved, injected)
      matchesTab = ["approved", "injected"].includes(submission.status);
    } else if (activeTab === "post-vaccination") {
      // Tab 3: Theo dõi sau tiêm (monitoring, completed)
      matchesTab = ["monitoring", "completed"].includes(submission.status);
    }

    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;
    const matchesClass =
      classFilter === "all" || submission.studentClass === classFilter;

    // Multi-field search: studentId, studentName, studentClass - Safe string conversion
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
      title: "Vaccine & Thông tin",
      key: "vaccine",
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: "13px", color: "#722ed1" }}>
            {record.vaccineName}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Số lần tiêm : {record.vaccinationType}
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
      title: "Ngày thực hiện",
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
          {/* Nếu chờ phản hồi parent, chỉ có thể sửa thông báo */}
          {record.status === "pending" && (
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              style={{ padding: "0 6px", fontSize: "12px" }}
            >
              Sửa
            </Button>
          )}
          {/* Nếu đã chấp nhận/xác nhận, có thể chuyển sang chờ tiêm */}
          {record.status === "confirmed" && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              onClick={() => handleUpdateProgress(record)}
              style={{ padding: "0 6px", fontSize: "12px" }}
            >
              Chuẩn bị tiêm
            </Button>
          )}
          {/* Nếu chờ tiêm, có thể thực hiện tiêm */}
          {record.status === "approved" && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              onClick={() => handleUpdateProgress(record)}
              style={{ padding: "0 6px", fontSize: "12px" }}
            >
              Thực hiện tiêm
            </Button>
          )}
          {/* Nếu đã tiêm, chuyển sang theo dõi (tự động chuyển tab) */}
          {record.status === "injected" && (
            <Button
              type="default"
              icon={<ClockCircleOutlined />}
              size="small"
              onClick={() => handleUpdateProgress(record)}
              style={{ padding: "0 6px", fontSize: "12px" }}
            >
              Bắt đầu theo dõi
            </Button>
          )}
          {/* Nếu đang theo dõi, có thể hoàn thành */}
          {record.status === "monitoring" && (
            <Button
              type="default"
              icon={<ClockCircleOutlined />}
              size="small"
              onClick={() => handleUpdateProgress(record)}
              style={{ padding: "0 6px", fontSize: "12px" }}
            >
              Hoàn thành
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
          background: "linear-gradient(90deg, #0DACCD 0%, #2980b9 100%)",
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
                    💉
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
                    Quản Lý Tiêm Chủng
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
                      Hệ thống tiếp nhận và quản lý tiêm chủng vaccine cho học
                      sinh tiểu học
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
                    {submissions.length}
                  </div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.9)",
                      fontWeight: "500",
                    }}
                  >
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
        {/* 📊 Thống kê trạng thái đơn tiêm chủng */}
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
                  minWidth: "25px",
                }}
              >
                <Text style={{ color: "white", fontSize: "24px" }}> 💉 </Text>
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
                  Thống kê trạng thái tiêm chủng
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    fontWeight: "400",
                  }}
                >
                  Tổng quan về các lịch tiêm chủng theo trạng thái xử lý
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
          bodyStyle={{ padding: "16px" }}
        >
          <Row gutter={[16, 16]} justify="center">
            {/* Chờ phản hồi */}
            <Col xs={12} sm={8} md={6} lg={3}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                  boxShadow: "0 10px 25px rgba(245, 158, 11, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "16px" }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    ⏳
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#d97706",
                      marginBottom: "4px",
                    }}
                  >
                    {submissions.filter((s) => s.status === "pending").length}
                  </div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#92400e",
                      fontWeight: "600",
                    }}
                  >
                    Chờ phản hồi
                  </Text>
                </div>
              </Card>
            </Col>

            {/* Đã chấp nhận */}
            <Col xs={12} sm={8} md={6} lg={3}>
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
                bodyStyle={{ padding: "16px" }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    ✅
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#2563eb",
                      marginBottom: "4px",
                    }}
                  >
                    {submissions.filter((s) => s.status === "confirmed").length}
                  </div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#1d4ed8",
                      fontWeight: "600",
                    }}
                  >
                    Đã chấp nhận
                  </Text>
                </div>
              </Card>
            </Col>

            {/* Chờ tiêm */}
            <Col xs={12} sm={8} md={6} lg={3}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #cffafe 0%, #a7f3d0 100%)",
                  boxShadow: "0 10px 25px rgba(6, 182, 212, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "16px" }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    🚀
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#0891b2",
                      marginBottom: "4px",
                    }}
                  >
                    {submissions.filter((s) => s.status === "approved").length}
                  </div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#0e7490",
                      fontWeight: "600",
                    }}
                  >
                    Chờ tiêm
                  </Text>
                </div>
              </Card>
            </Col>

            {/* Đã tiêm */}
            <Col xs={12} sm={8} md={6} lg={3}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "16px" }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    💉
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#16a34a",
                      marginBottom: "4px",
                    }}
                  >
                    {submissions.filter((s) => s.status === "injected").length}
                  </div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#15803d",
                      fontWeight: "600",
                    }}
                  >
                    Đã tiêm
                  </Text>
                </div>
              </Card>
            </Col>

            {/* Đang theo dõi */}
            <Col xs={12} sm={8} md={6} lg={3}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
                  boxShadow: "0 10px 25px rgba(147, 51, 234, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "16px" }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    🩺
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#9333ea",
                      marginBottom: "4px",
                    }}
                  >
                    {
                      submissions.filter((s) => s.status === "monitoring")
                        .length
                    }
                  </div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#7c3aed",
                      fontWeight: "600",
                    }}
                  >
                    Đang theo dõi
                  </Text>
                </div>
              </Card>
            </Col>

            {/* Hoàn thành */}
            <Col xs={12} sm={8} md={6} lg={3}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "16px" }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    🎉
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#16a34a",
                      marginBottom: "4px",
                    }}
                  >
                    {submissions.filter((s) => s.status === "completed").length}
                  </div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#15803d",
                      fontWeight: "600",
                    }}
                  >
                    Hoàn thành
                  </Text>
                </div>
              </Card>
            </Col>

            {/* Từ chối */}
            <Col xs={12} sm={8} md={6} lg={3}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                  boxShadow: "0 10px 25px rgba(239, 68, 68, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "16px" }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    ❌
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#dc2626",
                      marginBottom: "4px",
                    }}
                  >
                    {submissions.filter((s) => s.status === "rejected").length}
                  </div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#b91c1c",
                      fontWeight: "600",
                    }}
                  >
                    Từ chối
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
                          ? "⏳ Chờ phản hồi"
                          : status === "approved"
                          ? "✅ Chờ tiêm"
                          : status === "injected"
                          ? "💉 Đã tiêm"
                          : status === "monitoring"
                          ? "👁️ Đang theo dõi"
                          : status === "completed"
                          ? "🎯 Hoàn thành"
                          : status === "rejected"
                          ? "❌ Từ chối"
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

        {/* 📋 Bảng danh sách vaccine với Tabs */}
        <Card
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div className="flex gap-5">
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
                  <Text style={{ color: "white", fontSize: "24px" }}> 📋 </Text>
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
                    Danh sách tiêm chủng vaccine
                  </Text>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      fontWeight: "400",
                    }}
                  >
                    Quản lý và theo dõi tình trạng tiêm chủng vaccine của học
                    sinh
                  </Text>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                  style={{
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                    borderColor: "#52c41a",
                    boxShadow: "0 4px 12px rgba(82, 196, 26, 0.3)",
                    fontWeight: "600",
                  }}
                  size="middle"
                >
                  Thêm lịch tiêm chủng mới
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
          {/* 🎯 Tabs cho workflow vaccine - Đặt ngay dưới tiêu đề */}
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
                    📋 Chờ xác nhận (
                    {
                      submissions.filter((s) =>
                        ["pending", "confirmed", "rejected"].includes(s.status)
                      ).length
                    }
                    )
                  </span>
                ),
                children: (
                  /* Bảng danh sách cho Tab Chờ xác nhận */
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
                        `${range[0]}-${range[1]} của ${total} đơn chờ xác nhận`,
                    }}
                    scroll={{ x: 800 }}
                    style={{ borderRadius: "0 0 20px 20px" }}
                  />
                ),
              },
              {
                key: "vaccination",
                label: (
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>
                    💉 Tiêm chủng (
                    {
                      submissions.filter((s) =>
                        ["approved", "injected"].includes(s.status)
                      ).length
                    }
                    )
                  </span>
                ),
                children: (
                  /* Bảng danh sách cho Tab Tiêm chủng */
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
                        `${range[0]}-${range[1]} của ${total} đơn tiêm chủng`,
                    }}
                    scroll={{ x: 800 }}
                    style={{ borderRadius: "0 0 20px 20px" }}
                  />
                ),
              },
              {
                key: "post-vaccination",
                label: (
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>
                    🩺 Theo dõi sau tiêm (
                    {
                      submissions.filter((s) =>
                        ["monitoring", "completed"].includes(s.status)
                      ).length
                    }
                    )
                  </span>
                ),
                children: (
                  /* Bảng danh sách cho Tab Theo dõi sau tiêm */
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
                        `${range[0]}-${range[1]} của ${total} ca theo dõi`,
                    }}
                    scroll={{ x: 800 }}
                    style={{ borderRadius: "0 0 20px 20px" }}
                  />
                ),
              },
            ]}
          />
        </Card>

        {/* Modal xem chi tiết */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <EyeOutlined style={{ color: "#1890ff", fontSize: "20px" }} />
              <span>Chi tiết tiêm chủng vaccine</span>
            </div>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={700}
        >
          {selectedSubmission && (
            <div>
              <Descriptions
                title="Thông tin chi tiết"
                bordered
                column={2}
                size="small"
                style={{ marginBottom: "24px" }}
              >
                <Descriptions.Item label="Mã yêu cầu" span={2}>
                  <Text strong style={{ color: "#1890ff" }}>
                    {selectedSubmission.submissionCode}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Học sinh">
                  {selectedSubmission.studentName}
                </Descriptions.Item>
                <Descriptions.Item label="Lớp">
                  {selectedSubmission.studentClass}
                </Descriptions.Item>
                <Descriptions.Item label="Mã học sinh">
                  {selectedSubmission.studentId}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedSubmission.status)}>
                    {getStatusText(selectedSubmission.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tên vaccine" span={2}>
                  <Text strong style={{ color: "#722ed1" }}>
                    {selectedSubmission.vaccineName} - <strong>ID :</strong>
                    {""}
                    {selectedSubmission.vaccineID}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số lần tiêm">
                  {selectedSubmission.vaccinationType}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày gửi" span={2}>
                  {dayjs(selectedSubmission.submissionDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
                {selectedSubmission.verificationNotes && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {selectedSubmission.verificationNotes}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Hiển thị ảnh vaccine */}
              {selectedSubmission.vaccineImages &&
                selectedSubmission.vaccineImages.length > 0 && (
                  <div style={{ marginTop: "24px" }}>
                    <Text
                      strong
                      style={{
                        fontSize: "16px",
                        marginBottom: "12px",
                        display: "block",
                      }}
                    >
                      📸 Hình ảnh vaccine:
                    </Text>
                    <Row gutter={[12, 12]}>
                      {selectedSubmission.vaccineImages.map((image, index) => (
                        <Col xs={24} sm={12} md={8} key={index}>
                          <div
                            style={{
                              border: "2px solid #e5e7eb",
                              borderRadius: "12px",
                              padding: "8px",
                              textAlign: "center",
                              backgroundColor: "#f9fafb",
                            }}
                          >
                            <img
                              src={image}
                              alt={`Vaccine ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "120px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "block";
                              }}
                            />
                            <div
                              style={{
                                display: "none",
                                padding: "20px",
                                color: "#6b7280",
                                fontSize: "12px",
                              }}
                            >
                              Không thể tải ảnh
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

              {(!selectedSubmission.vaccineImages ||
                selectedSubmission.vaccineImages.length === 0) && (
                <div
                  style={{
                    marginTop: "24px",
                    padding: "20px",
                    textAlign: "center",
                    backgroundColor: "#f9fafb",
                    borderRadius: "12px",
                    border: "2px dashed #d1d5db",
                  }}
                >
                  <Text style={{ color: "#6b7280", fontSize: "14px" }}>
                    📷 Chưa có hình ảnh vaccine
                  </Text>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Modal thêm vaccine mới */}
        <Modal
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "8px 0",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px rgba(16, 185, 129, 0.3)",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <span style={{ fontSize: "24px" }}> 💉 </span>
              </div>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "20px",
                    color: "#1f2937",
                    display: "flex",
                    marginBottom: "4px",
                  }}
                >
                  Tạo yêu cầu tiêm chủng
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    fontWeight: "400",
                  }}
                >
                  Tạo lịch tiêm vaccine cho học sinh hoặc cả lớp
                </Text>
              </div>
            </div>
          }
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onOk={() => createForm.submit()}
          okText="Tạo yêu cầu tiêm chủng"
          cancelText="Hủy bỏ"
          width={650}
          okButtonProps={{
            style: {
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderColor: "#10b981",
              borderRadius: "8px",
              fontWeight: "600",
              height: "40px",
              fontSize: "14px",
            },
          }}
          cancelButtonProps={{
            style: {
              borderRadius: "8px",
              height: "40px",
              fontSize: "14px",
            },
          }}
        >
          <Form
            form={createForm}
            layout="vertical"
            onFinish={handleCreateVaccine}
            style={{ marginTop: "24px" }}
            requiredMark="optional"
          >
            {/* Chọn loại tạo yêu cầu */}
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  🎯 Loại yêu cầu tiêm chủng
                </span>
              }
              name="createType"
              rules={[
                { required: true, message: "Vui lòng chọn loại yêu cầu!" },
              ]}
              initialValue="student"
              style={{ marginBottom: "24px" }}
            >
              <Radio.Group
                style={{
                  width: "100%",
                  display: "flex",
                  gap: "12px",
                }}
                size="large"
              >
                <Radio.Button
                  value="student"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                    border: "2px solid #e5e7eb",
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  }}
                >
                  👤 Cho 1 học sinh
                </Radio.Button>
                <Radio.Button
                  value="class"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                    border: "2px solid #e5e7eb",
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  }}
                >
                  🏫 Cho cả lớp
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            {/* Conditional fields based on createType */}
            <Form.Item shouldUpdate>
              {({ getFieldValue }) => {
                const createType = getFieldValue("createType");

                if (createType === "student") {
                  return (
                    <Form.Item
                      label="Mã học sinh"
                      name="studentId"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mã học sinh!",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập mã học sinh (vd: ST0003)..." />
                    </Form.Item>
                  );
                } else {
                  return (
                    <Form.Item
                      label="Chọn lớp"
                      name="classId"
                      rules={[
                        { required: true, message: "Vui lòng chọn lớp!" },
                      ]}
                    >
                      <Select placeholder="Chọn lớp để tạo yêu cầu tiêm chủng">
                        {classes.map((cls) => (
                          <Option key={cls} value={cls}>
                            🏫 Lớp {cls}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  );
                }
              }}
            </Form.Item>

            <Form.Item
              label={
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  🆔 ID Vaccine
                </span>
              }
              name="vaccineId"
              rules={[{ required: true, message: "Vui lòng nhập ID vaccine!" }]}
              initialValue="1"
              style={{ marginBottom: "20px" }}
            >
              <Input
                placeholder="Nhập ID vaccine (mặc định: 1)..."
                size="large"
                style={{
                  borderRadius: "8px",
                  fontSize: "14px",
                  padding: "12px 16px",
                }}
              />
            </Form.Item>

            <Form.Item
              label={
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  💊 Số liều
                </span>
              }
              name="dose"
              rules={[{ required: true, message: "Vui lòng nhập số liều!" }]}
              initialValue="1"
              style={{ marginBottom: "20px" }}
            >
              <Input
                placeholder="Nhập số liều (vd: 1, 2, 3)..."
                size="large"
                style={{
                  borderRadius: "8px",
                  fontSize: "14px",
                  padding: "12px 16px",
                }}
              />
            </Form.Item>

            <Form.Item
              label={
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  📝 Ghi chú tiêm chủng
                </span>
              }
              name="administrationNotes"
              rules={[{ required: true, message: "Vui lòng nhập ghi chú!" }]}
              style={{ marginBottom: "24px" }}
            >
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú tiêm chủng chi tiết..."
                size="large"
                style={{
                  borderRadius: "8px",
                  fontSize: "14px",
                  resize: "none",
                }}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal cập nhật tiến độ tiêm chủng */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <ClockCircleOutlined
                style={{ color: "#fa8c16", fontSize: "20px" }}
              />
              <span>Cập nhật tiến độ tiêm chủng</span>
            </div>
          }
          open={updateModalVisible}
          onCancel={() => setUpdateModalVisible(false)}
          onOk={() => updateForm.submit()}
          okText="Cập nhật"
          cancelText="Hủy"
        >
          <Form
            form={updateForm}
            layout="vertical"
            onFinish={handleUpdateProgressSubmit}
          >
            <Form.Item label="Trạng thái hiện tại" name="currentStatus">
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Trạng thái mới"
              name="newStatus"
              rules={[
                { required: true, message: "Vui lòng chọn trạng thái mới!" },
              ]}
            >
              <Select>
                <Option value="injected">💉 Đã tiêm</Option>
                <Option value="monitoring">👁️ Đang theo dõi</Option>
                <Option value="completed">🎯 Hoàn thành</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Thời gian tiêm chủng" name="administrationTime">
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
                placeholder="Chọn thời gian tiêm..."
              />
            </Form.Item>
            <Form.Item label="Ghi chú tiến độ" name="progressNotes">
              <TextArea
                rows={3}
                placeholder="Nhập ghi chú về tiến độ tiêm chủng..."
              />
            </Form.Item>
            <Form.Item
              label="Hình ảnh bổ sung"
              name="image"
              valuePropName="fileList"
              getValueFromEvent={(e) =>
                Array.isArray(e) ? e : e && e.fileList
              }
            >
              <Upload
                listType="picture-card"
                beforeUpload={() => false}
                multiple
                maxCount={5}
                accept="image/*"
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                  showDownloadIcon: false,
                }}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal chỉnh sửa vaccine */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <EditOutlined style={{ color: "#722ed1", fontSize: "20px" }} />
              <span>Chỉnh sửa thông tin vaccine</span>
            </div>
          }
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onOk={() => editForm.submit()}
          okText="Lưu thay đổi"
          cancelText="Hủy"
          width={600}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  ID Vaccine
                </span>
              }
              name="vaccineId"
              rules={[{ required: true, message: "Vui lòng nhập ID vaccine!" }]}
              style={{ marginBottom: "20px" }}
            >
              <Input
                placeholder="Nhập ID vaccine (mặc định: 1)..."
                size="large"
                style={{
                  borderRadius: "8px",
                  fontSize: "14px",
                  padding: "12px 16px",
                }}
              />
            </Form.Item>

            <Form.Item
              label={
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Số liều
                </span>
              }
              name="dose"
              rules={[{ required: true, message: "Vui lòng nhập số liều!" }]}
              style={{ marginBottom: "20px" }}
            >
              <Input
                placeholder="Nhập số liều (vd: 1, 2, 3)..."
                size="large"
                style={{
                  borderRadius: "8px",
                  fontSize: "14px",
                  padding: "12px 16px",
                }}
              />
            </Form.Item>

            <Form.Item
              label={
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  📝 Ghi chú
                </span>
              }
              name="notes"
              style={{ marginBottom: "20px" }}
            >
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú tiêm chủng (tùy chọn)..."
                style={{
                  borderRadius: "8px",
                  fontSize: "14px",
                  resize: "none",
                }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
export default VaccinationManagement;
