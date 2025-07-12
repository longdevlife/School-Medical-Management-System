import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Card,
  Tag,
  message,
  Row,
  Col,
  Descriptions,
  Typography,
  Spin,
  Empty,
  Badge,
  Tooltip,
  Select,
  Tabs,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  HeartOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import healthCheckupApi from "../../api/healthCheckApi";
import studentApi from "../../api/studentApi";
import appointApi from "../../api/appointApi";
import dayjs from "dayjs";

const { Text } = Typography;
const { Option } = Select;

const HealthResult = () => {
  const [healthCheckups, setHealthCheckups] = useState([]);
  const [confirmedHistory, setConfirmedHistory] = useState([]); // Lịch sử đã xác nhận
  const [appointments, setAppointments] = useState([]); // Danh sách appointments
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [viewingCheckup, setViewingCheckup] = useState(null);
  const [isAppointmentDetailModalVisible, setIsAppointmentDetailModalVisible] =
    useState(false);
  const [viewingAppointment, setViewingAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("waiting"); // Tab hiện tại

  // Student management states
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentsLoading, setStudentsLoading] = useState(false);

  // ==================== API FUNCTIONS ====================

  const fetchStudents = useCallback(async () => {
    try {
      setStudentsLoading(true);
      console.log("🔄 Đang lấy danh sách học sinh của phụ huynh...");

      const response = await studentApi.parent.getMyChildren();
      console.log("✅ API getMyChildren response:", response);

      const studentsData = response.data || [];

      if (Array.isArray(studentsData) && studentsData.length > 0) {
        const processedStudents = studentsData.map((student) => ({
          StudentID: student.studentID || student.StudentID || student.id,
          StudentName:
            student.studentName ||
            student.StudentName ||
            student.name ||
            "Học sinh",
          StudentCode:
            student.studentID ||
            student.StudentID ||
            student.studentCode ||
            student.id,
          Class:
            student.class ||
            student.className ||
            student.ClassName ||
            student.grade ||
            student.classRoom ||
            student.class_name ||
            "Chưa phân lớp",
        }));

        console.log("📋 Danh sách học sinh đã xử lý:", processedStudents);
        setStudents(processedStudents);

        // Tự động chọn học sinh đầu tiên nếu chưa chọn
        if (processedStudents.length > 0 && !selectedStudentId) {
          console.log(
            "🔍 Tự động chọn học sinh đầu tiên:",
            processedStudents[0].StudentID
          );
          setSelectedStudentId(processedStudents[0].StudentID);
        }

        console.log(`✅ Đã tải ${processedStudents.length} học sinh`);
      } else {
        console.warn(
          "⚠️ Không có dữ liệu học sinh hoặc dữ liệu không hợp lệ:",
          studentsData
        );
        setStudents([]);
        message.warning("Không tìm thấy thông tin học sinh");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách học sinh:", error);
      message.error("Không thể tải danh sách học sinh. Vui lòng thử lại!");
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, [selectedStudentId]); // Dependencies cho useCallback fetchStudents

  const fetchAppointments = useCallback(async () => {
    if (!selectedStudentId) {
      setAppointments([]);
      return;
    }

    try {
      console.log("FE gửi studentId lên backend:", selectedStudentId);
      // 🎯 Gọi API để lấy appointments cho học sinh
      console.log(
        "🔄 Đang lấy danh sách appointments cho học sinh:",
        selectedStudentId
      );
      const res = await appointApi.parent.getAppointmentsByStudentId(
        selectedStudentId
      );
      console.log("✅ Appointments response:", res);
      setAppointments(res.data || []);
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách appointments:", error);
      setAppointments([]);
    }
  }, [selectedStudentId]); // Dependencies cho useCallback fetchAppointments

  const fetchHealthCheckups = useCallback(async () => {
    if (!selectedStudentId) {
      console.log("FE gửi studentId lên backend:", selectedStudentId);
      setHealthCheckups([]);
      setConfirmedHistory([]);

      return;
    }

    try {
      setLoading(true);
      console.log(
        "🔄 Đang lấy danh sách health checkup cho học sinh:",
        selectedStudentId
      );

      // Lấy thông tin user hiện tại để có parentId
      const userInfoResponse =
        await healthCheckupApi.parent.getCurrentUserInfo();
      const parentId = userInfoResponse?.data?.user?.userID;

      if (!parentId) {
        console.error(
          "❌ Không tìm thấy parentId trong user info:",
          userInfoResponse?.data
        );
        message.error("Không thể xác định thông tin phụ huynh");
        setHealthCheckups([]);
        setConfirmedHistory([]);
        return;
      }

      console.log("👤 Parent ID:", parentId);

      // 🎯 Gọi API để lấy health checkups
      const response =
        await healthCheckupApi.parent.getHealthCheckupsByParentId(parentId);
      console.log("✅ Health checkup response:", response);
      console.log("✅ Health checkup response.data:", response.data);
      console.log(
        "✅ Health checkup response structure:",
        JSON.stringify(response.data, null, 2)
      );

      const healthCheckupData = response.data || [];

      if (Array.isArray(healthCheckupData)) {
        console.log("🔍 Total health checkup items:", healthCheckupData.length);

        // Debug: Log cấu trúc của item đầu tiên để xem appointment ở đâu
        if (healthCheckupData.length > 0) {
          const firstItem = healthCheckupData[0];
          console.log("🔍 First item structure:", firstItem);
          console.log("🔍 First item keys:", Object.keys(firstItem));
          console.log(
            "🔍 appointment field (lowercase):",
            firstItem.appointment
          );
          console.log(
            "🔍 Appointment field (uppercase):",
            firstItem.Appointment
          );
          console.log(
            "🔍 appointments field (lowercase plural):",
            firstItem.appointments
          );
          console.log(
            "🔍 Appointments field (uppercase plural):",
            firstItem.Appointments
          );

          // Kiểm tra sâu hơn nếu có nested object
          if (
            firstItem.appointment &&
            typeof firstItem.appointment === "object"
          ) {
            console.log(
              "🔍 appointment detail:",
              JSON.stringify(firstItem.appointment, null, 2)
            );
          }
          if (
            firstItem.Appointment &&
            typeof firstItem.Appointment === "object"
          ) {
            console.log(
              "🔍 Appointment detail:",
              JSON.stringify(firstItem.Appointment, null, 2)
            );
          }
          if (firstItem.appointments && Array.isArray(firstItem.appointments)) {
            console.log(
              "🔍 appointments array length:",
              firstItem.appointments.length
            );
            console.log(
              "🔍 appointments detail:",
              JSON.stringify(firstItem.appointments, null, 2)
            );
          }
          if (firstItem.Appointments && Array.isArray(firstItem.Appointments)) {
            console.log(
              "🔍 Appointments array length:",
              firstItem.Appointments.length
            );
            console.log(
              "🔍 Appointments detail:",
              JSON.stringify(firstItem.Appointments, null, 2)
            );
          }
        }

        // Lọc health checkup theo học sinh đã chọn
        const filteredHealthCheckups = healthCheckupData.filter((item) => {
          const match =
            item.studentID &&
            selectedStudentId &&
            item.studentID.toString().toLowerCase() ===
              selectedStudentId.toString().toLowerCase();
          return match;
        });

        // Chuẩn hóa dữ liệu
        const normalizedHealthCheckups = filteredHealthCheckups.map((item) => {
          console.log("🔍 Processing HealthCheckUp item:", item);
          console.log(
            "🔍 Appointment data:",
            item.appointment || item.Appointment
          );
          console.log("🔍 All item keys:", Object.keys(item));

          return {
            key: item.healthCheckUpID || item.HealthCheckUpID,
            HealthCheckUpID: item.healthCheckUpID || item.HealthCheckUpID,
            CheckDate: item.checkDate || item.CheckDate,
            Height: item.height || item.Height,
            Weight: item.weight || item.Weight,
            BMI: item.bmi || item.BMI,
            VisionLeft: item.visionLeft || item.VisionLeft,
            VisionRight: item.visionRight || item.VisionRight,
            BloodPressure: item.bloodPressure || item.BloodPressure,
            Dental: item.dental || item.Dental,
            Skin: item.skin || item.Skin,
            Hearing: item.hearing || item.Hearing,
            Respiration: item.respiration || item.Respiration,
            Cardiovascular: item.cardiovascular || item.Cardiovascular,
            Notes: item.notes || item.Notes,
            Status: item.status || item.Status,
            StudentID: item.studentID || item.StudentID,
            StudentName:
              item.studentProfile?.studentName ||
              item.StudentProfile?.StudentName ||
              "Học sinh",
            CheckerName:
              item.checker?.fullName ||
              item.Checker?.FullName ||
              "Chưa xác định",
          };
        });

        // 🎯 Phân loại health checkup cho "Kết quả khám sức khỏe"
        // Tab "Chờ xác nhận": Những health checkup chưa được phụ huynh xác nhận
        const waitingHealthCheckups = normalizedHealthCheckups.filter(
          (item) => {
            const status = item.Status?.toLowerCase() || "";
            return (
              status === "pending" || // Chờ xác nhận
              status === "chờ xác nhận" || // Chờ xác nhận (tiếng Việt)
              status === "not response" || // Chưa phản hồi
              status === "chưa phản hồi" || // Chưa phản hồi (tiếng Việt)
              status === "waiting" || // Đang chờ
              status === "new" || // Mới
              status === "created" // Vừa tạo
            );
          }
        );

        // Tab "Lịch sử": Những health checkup đã được xử lý (xác nhận hoặc từ chối)
        const processedHealthCheckups = normalizedHealthCheckups.filter(
          (item) => {
            const status = item.Status?.toLowerCase() || "";
            return (
              status === "confirmed" || // Đã xác nhận
              status === "đã xác nhận" || // Đã xác nhận (tiếng Việt)
              status === "approved" || // Đã duyệt
              status === "completed" || // Hoàn thành
              status === "hoàn thành" || // Hoàn thành (tiếng Việt)
              status === "denied" || // Đã từ chối
              status === "từ chối" || // Từ chối (tiếng Việt)
              status === "đã từ chối" || // Đã từ chối (tiếng Việt)
              status === "rejected" || // Đã từ chối
              status === "cancelled" // Đã hủy
            );
          }
        );

        console.log(
          "📋 Health checkup đã lọc theo học sinh:",
          filteredHealthCheckups
        );
        console.log("📊 Phân loại health checkup:");
        console.log(
          "  - Chờ xác nhận (waitingHealthCheckups):",
          waitingHealthCheckups.map((v) => `${v.HealthCheckUpID}:${v.Status}`)
        );
        console.log(
          "  - Lịch sử (processedHealthCheckups):",
          processedHealthCheckups.map((v) => `${v.HealthCheckUpID}:${v.Status}`)
        );

        setHealthCheckups(waitingHealthCheckups);
        setConfirmedHistory(processedHealthCheckups);

        console.log(
          `✅ Đã tải ${normalizedHealthCheckups.length} health checkup records`
        );

        // 🎯 Sau khi xử lý xong health checkup, kiểm tra xem có appointment nào không
        // Chỉ gọi fetchAppointments nếu có ít nhất 1 health checkup có appointment
        const hasAppointments = normalizedHealthCheckups.some((item) => {
          // Kiểm tra các trường appointment có thể có
          return (
            item.appointment ||
            item.Appointment ||
            item.appointments ||
            item.Appointments
          );
        });

        if (hasAppointments) {
          console.log(
            "🔄 Có appointment trong health checkup, đang tải danh sách appointments..."
          );
          await fetchAppointments();
        } else {
          console.log(
            "⚠️ Không có appointment nào trong health checkup, bỏ qua việc tải appointments"
          );
          setAppointments([]);
        }
      } else {
        console.warn(
          "⚠️ Dữ liệu health checkup không hợp lệ:",
          healthCheckupData
        );
        setHealthCheckups([]);
        setConfirmedHistory([]);
        setAppointments([]); // Clear appointments nếu không có health checkup
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách health checkup:", error);
      message.error("Không thể tải danh sách khám sức khỏe. Vui lòng thử lại!");
      setHealthCheckups([]);
      setConfirmedHistory([]);
      setAppointments([]); // Clear appointments nếu có lỗi
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, fetchAppointments]); // Dependencies cho useCallback fetchHealthCheckups

  // Component mount
  useEffect(() => {
    console.log("🚀 HealthResult component mounting...");
    fetchStudents();
  }, [fetchStudents]);

  // Effect để tải health checkup khi selectedStudentId thay đổi
  useEffect(() => {
    if (selectedStudentId) {
      console.log("🔄 Học sinh đã thay đổi:", selectedStudentId);
      fetchHealthCheckups();
    }
  }, [selectedStudentId, fetchHealthCheckups]);

  // ==================== HANDLER FUNCTIONS ====================

  const handleViewDetail = (record) => {
    console.log("👁️ Viewing health checkup detail:", record);
    setViewingCheckup(record);
    setIsDetailModalVisible(true);
  };

  // ==================== RENDER FUNCTIONS ====================

  const handleConfirmHealthCheckup = async (healthCheckupId) => {
    try {
      console.log("🔄 Đang xác nhận health checkup:", healthCheckupId);

      await healthCheckupApi.parent.confirmHealthCheckup({
        heathCheckUpID: healthCheckupId,
        resson: "Phụ huynh đã xác nhận",
      });

      message.success("Đã xác nhận lịch khám sức khỏe");
      fetchHealthCheckups(); // Reload data
    } catch (error) {
      console.error("❌ Lỗi khi xác nhận:", error);
      message.error("Không thể xác nhận lịch khám. Vui lòng thử lại!");
    }
  };

  const handleDenyHealthCheckup = async (healthCheckupId) => {
    try {
      console.log("🔄 Đang từ chối health checkup:", healthCheckupId);

      await healthCheckupApi.parent.denyHealthCheckup({
        heathCheckUpID: healthCheckupId,
        resson: "Phụ huynh từ chối",
      });

      message.success("Đã từ chối lịch khám sức khỏe");
      fetchHealthCheckups(); // Reload data
    } catch (error) {
      console.error("❌ Lỗi khi từ chối:", error);
      message.error("Không thể từ chối lịch khám. Vui lòng thử lại!");
    }
  };

  // ==================== APPOINTMENT HANDLER FUNCTIONS ====================

  const handleConfirmAppointment = async (appointmentId, notes = "") => {
    try {
      console.log(
        "🔄 Đang xác nhận appointment:",
        appointmentId,
        "với ghi chú:",
        notes
      );

      const response = await appointApi.parent.confirmAppointment({
        AppointmentID: appointmentId,
        Notes: notes,
      });

      console.log("✅ Xác nhận appointment thành công:", response);
      message.success("Đã xác nhận tham gia cuộc hẹn thành công!");

      // Refresh danh sách - chỉ gọi fetchHealthCheckups, nó sẽ tự gọi fetchAppointments
      await fetchHealthCheckups();
    } catch (error) {
      console.error("❌ Lỗi khi xác nhận appointment:", error);
      message.error("Xác nhận appointment thất bại. Vui lòng thử lại!");
    }
  };

  const handleDeniedAppointment = async (appointmentId, notes = "") => {
    try {
      console.log(
        "🔄 Đang từ chối appointment:",
        appointmentId,
        "với ghi chú:",
        notes
      );

      const response = await appointApi.parent.deniedAppointment({
        AppointmentID: appointmentId,
        Notes: notes,
      });

      console.log("✅ Từ chối appointment thành công:", response);
      message.success("Đã từ chối cuộc hẹn thành công!");

      // Refresh danh sách - chỉ gọi fetchHealthCheckups, nó sẽ tự gọi fetchAppointments
      await fetchHealthCheckups();
    } catch (error) {
      console.error("❌ Lỗi khi từ chối appointment:", error);
      message.error("Từ chối appointment thất bại. Vui lòng thử lại!");
    }
  };

  const handleViewAppointmentDetail = (record) => {
    console.log("👁️ Viewing appointment detail:", record);
    setViewingAppointment(record);
    setIsAppointmentDetailModalVisible(true);
  };

  // ==================== HELPER FUNCTIONS ====================

  const getStatusTag = (status) => {
    const normalizedStatus = (status || "").toLowerCase();

    const statusConfig = {
      pending: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Chờ xác nhận",
      },
      "chờ xác nhận": {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Chờ xác nhận",
      },
      "not response": {
        color: "default",
        icon: <ExclamationCircleOutlined />,
        text: "Chưa phản hồi",
      },
      "chưa phản hồi": {
        color: "default",
        icon: <ExclamationCircleOutlined />,
        text: "Chưa phản hồi",
      },
      waiting: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Đang chờ",
      },
      new: {
        color: "blue",
        icon: <ClockCircleOutlined />,
        text: "Mới",
      },
      created: {
        color: "blue",
        icon: <ClockCircleOutlined />,
        text: "Vừa tạo",
      },
      confirmed: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Đã xác nhận",
      },
      "đã xác nhận": {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Đã xác nhận",
      },
      approved: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Đã duyệt",
      },
      completed: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      "hoàn thành": {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      denied: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Đã từ chối",
      },
      "từ chối": {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Đã từ chối",
      },
      "đã từ chối": {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Đã từ chối",
      },
      rejected: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Đã từ chối",
      },
      cancelled: {
        color: "gray",
        icon: <ExclamationCircleOutlined />,
        text: "Đã hủy",
      },
    };

    const config = statusConfig[normalizedStatus] || {
      color: "default",
      icon: <ClockCircleOutlined />,
      text: status || "Chưa xác định",
    };

    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Thời gian không hợp lệ";
    }
  };

  const getAppointmentStatusTag = (status) => {
    const normalizedStatus = (status || "").toLowerCase();

    const statusConfig = {
      pending: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Chờ xác nhận",
      },
      confirmed: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Đã xác nhận",
      },
      denied: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Đã từ chối",
      },
      completed: {
        color: "blue",
        icon: <CheckCircleOutlined />,
        text: "Đã hoàn thành",
      },
    };

    const config = statusConfig[normalizedStatus] || {
      color: "default",
      icon: <ClockCircleOutlined />,
      text: status || "Chưa xác định",
    };

    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const canTakeAppointmentAction = (status) => {
    const normalizedStatus = (status || "").toLowerCase();
    return (
      normalizedStatus === "pending" || normalizedStatus === "chờ xác nhận"
    );
  };

  // ==================== TABLE COLUMNS ====================

  // Columns cho tab "Chờ xác nhận"
  const waitingColumns = [
    {
      title: "Mã khám",
      dataIndex: "healthCheckUpID",
      key: "healthCheckUpID",
      width: 120,
      render: (text) => (
        <Text strong className="text-blue-600 text-xs">
          {text || "N/A"}
        </Text>
      ),
    },
    {
      title: "Ngày khám",
      dataIndex: "CheckDate",
      key: "CheckDate",
      width: 140,
      render: (date) => (
        <div className="text-center">
          <div className="text-xs font-medium" style={{ display: "flex" }}>
            {date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa có"}
          </div>
          <div className="text-xs text-gray-500" style={{ display: "flex" }}>
            {date
              ? new Date(date).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Chiều cao",
      dataIndex: "Height",
      key: "Height",
      width: 90,
      render: (height) => (
        <Text strong className="text-purple-700 text-xs">
          {height ? `${height} cm` : "Chưa đo"}
        </Text>
      ),
    },
    {
      title: "Cân nặng",
      dataIndex: "Weight",
      key: "Weight",
      width: 90,
      render: (weight) => (
        <Text strong className="text-blue-700 text-xs">
          {weight ? `${weight} kg` : "Chưa đo"}
        </Text>
      ),
    },
    {
      title: "BMI",
      dataIndex: "BMI",
      key: "BMI",
      width: 80,
      render: (bmi) => (
        <Text strong className="text-green-700 text-xs">
          {bmi ? bmi.toFixed(1) : "Chưa tính"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "Status",
      key: "Status",
      width: 150,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_, record) => {
        const status = (record.Status || "").toLowerCase();
        const isPending =
          status === "pending" ||
          status === "chờ xác nhận" ||
          status === "not response" ||
          status === "chưa phản hồi" ||
          status === "waiting" ||
          status === "new" ||
          status === "created";

        if (isPending) {
          return (
            <div style={{ display: "flex", gap: 4, flexDirection: "column" }}>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() =>
                  handleConfirmHealthCheckup(record.HealthCheckUpID)
                }
                style={{ fontSize: "11px", height: "24px" }}
              >
                Xác nhận
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleDenyHealthCheckup(record.HealthCheckUpID)}
                style={{ fontSize: "11px", height: "24px" }}
              >
                Từ chối
              </Button>
            </div>
          );
        }

        return (
          <div style={{ display: "flex", gap: 4, flexDirection: "column" }}>
            <Tooltip title="Xem chi tiết">
              <Button
                type="default"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleViewDetail(record)}
                style={{ color: "blue", fontSize: "11px", height: "24px" }}
              >
                Chi tiết
              </Button>
            </Tooltip>
            <Text
              type="secondary"
              style={{ fontSize: "10px", textAlign: "center" }}
            >
              Đã xử lý
            </Text>
          </div>
        );
      },
    },
  ];

  // Columns cho lịch sử đã xử lý
  const historyColumns = [
    {
      title: "Mã khám",
      dataIndex: "HealthCheckUpID",
      key: "HealthCheckUpID",
      width: 120,
      render: (text) => (
        <Text strong className="text-blue-500 text-xs">
          {text || "N/A"}
        </Text>
      ),
    },
    {
      title: "Ngày khám",
      dataIndex: "CheckDate",
      key: "CheckDate",
      width: 120,
      render: (text) => (
        <Text className="text-xs font-medium" style={{ color: "black" }}>
          {formatDate(text)}
        </Text>
      ),
    },
    {
      title: "Chiều cao",
      dataIndex: "Height",
      key: "Height",
      width: 80,
      render: (height) => (
        <Text strong className="text-blue-500 text-xs">
          {height ? `${height} cm` : "N/A"}
        </Text>
      ),
    },
    {
      title: "Cân nặng",
      dataIndex: "Weight",
      key: "Weight",
      width: 80,
      render: (weight) => (
        <Text strong className="text-blue-500 text-xs">
          {weight ? `${weight} kg` : "N/A"}
        </Text>
      ),
    },
    {
      title: "BMI",
      dataIndex: "BMI",
      key: "BMI",
      width: 80,
      render: (bmi) => (
        <Text strong className="text-blue-500 text-xs">
          {bmi ? bmi.toFixed(1) : "N/A"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "Status",
      key: "Status",
      width: 140,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
            style={{ color: "blue" }}
          >
            Chi tiết
          </Button>
        </Tooltip>
      ),
    },
  ];

  // Columns cho appointments (lịch tư vấn) - Giống layout lịch sử khám
  const appointmentColumns = [
    {
      title: "Mã lịch hẹn",
      dataIndex: "appointmentID",
      key: "appointmentID",
      width: 120,
      render: (text) => (
        <Text strong style={{ fontSize: "12px", color: "#1890ff" }}>
          {text || "N/A"}
        </Text>
      ),
    },
    {
      title: "Thời gian hẹn",
      key: "dateTime",
      width: 180,
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: "13px" }}>
            <strong>📅 Ngày:</strong>{" "}
            {record.dateTime
              ? dayjs(record.dateTime).format("DD/MM/YYYY")
              : "Chưa xác định"}
          </Text>
          <br />
          <Text style={{ fontSize: "13px" }}>
            <strong>🕐 Giờ:</strong>{" "}
            {record.dateTime
              ? dayjs(record.dateTime).format("HH:mm")
              : "Chưa xác định"}
          </Text>
          <br />
          <Text style={{ fontSize: "13px", color: "#722ed1" }}>
            <strong>📍 Địa điểm:</strong> {record.location || "Chưa xác định"}
          </Text>
        </div>
      ),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      width: 180,
      render: (reason) => (
        <Text style={{ fontSize: "13px", color: "black" }}>
          {reason || "Không có lý do"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status) => getAppointmentStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-start" }}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="default"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewAppointmentDetail(record)}
              style={{ color: "blue" }}
            >
              Chi tiết & phản hồi
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "0px",
        background:
          "linear-gradient(135deg, rgb(248, 250, 252) 0%, rgb(226, 232, 240) 50%, rgb(241,245,249) 100%)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg, #0DACCD 0%, #2980b9 100%)",
          borderRadius: "32px",
          boxShadow: "0 10px 32px rgba(22,160,133,0.18)",
          padding: "32px 40px 28px 40px",
          margin: "32px 0 24px 0",
          maxWidth: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 120,
        }}
      >
        {/* Left: Icon + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* Icon */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: "linear-gradient(135deg, #d1f2eb 0%, #80e5d1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 8px 24px rgba(128,229,209,0.25), inset 0 2px 4px rgba(255,255,255,0.3)",
              border: "2px solid rgba(255,255,255,0.4)",
              backdropFilter: "blur(2px)",
            }}
          >
            <span
              style={{
                fontSize: 44,
                filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.13))",
              }}
            >
              🏥
            </span>
          </div>
          {/* Title + Subtitle */}
          <div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: "#fff",
                textShadow: "2px 2px 8px rgba(0,0,0,0.13)",
                letterSpacing: "0.5px",
                marginBottom: 8,
              }}
            >
              Khám sức khỏe
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 0 4px rgba(16,185,129,0.18)",
                }}
              />
              <span
                style={{
                  fontSize: 17,
                  color: "#f3f4f6",
                  fontWeight: 500,
                  textShadow: "1px 1px 3px rgba(0,0,0,0.10)",
                }}
              >
                Theo dõi và quản lý kết quả khám sức khỏe định kỳ
              </span>
            </div>
          </div>
        </div>
        {/* Right: Tổng đơn + Ngày */}
        <div style={{ display: "flex", gap: 18 }}>
          {/* Tổng đơn */}
          <div
            style={{
              background: "rgba(255,255,255,0.13)",
              borderRadius: 18,
              padding: "18px 28px",
              minWidth: 90,
              textAlign: "center",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(16,185,129,0.12)",
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 4 }}>
              <span role="img" aria-label="list">
                📋
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {healthCheckups.length + confirmedHistory.length}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Lần khám</div>
          </div>
          {/* Appointments */}
          <div
            style={{
              background: "rgba(255,255,255,0.13)",
              borderRadius: 18,
              padding: "18px 28px",
              minWidth: 90,
              textAlign: "center",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(16,185,129,0.12)",
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 4 }}>
              <span role="img" aria-label="calendar">
                📅
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {appointments.length}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Lịch hẹn</div>
          </div>
          {/* Ngày hôm nay */}
          <div
            style={{
              background: "rgba(255,255,255,0.13)",
              borderRadius: 18,
              padding: "18px 28px",
              minWidth: 110,
              textAlign: "center",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(16,185,129,0.12)",
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 4 }}>
              <span role="img" aria-label="clock">
                ⏰
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {new Date().toLocaleDateString("vi-VN")}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Hôm nay</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {selectedStudentId && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Row justify="center" style={{ marginBottom: 32 }}>
            <Col xs={24}>
              <Card
                style={{
                  borderRadius: 20,
                  border: "none",
                  background: "white",
                  boxShadow:
                    "0 8px 32px rgba(127,90,240,0.07), 0 0 0 1px #f3f4f6",
                  marginBottom: 0,
                }}
                bodyStyle={{ padding: "24px 32px" }}
                title={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(16,185,129,0.13)",
                        border: "2px solid rgba(255,255,255,0.2)",
                        transform: "perspective(1000px) rotateX(5deg)",
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                      }}
                    >
                      <span
                        style={{
                          color: "white",
                          fontSize: 20,
                          textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      >
                        🏥
                      </span>
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                        Thống kê trạng thái khám sức khỏe
                      </Text>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        Tổng quan về các lần khám theo trạng thái xử lý
                      </div>
                    </div>
                  </div>
                }
              >
                <Row gutter={24} justify="center">
                  <Col xs={24} md={4}>
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                        borderRadius: 18,
                        padding: "20px 0",
                        textAlign: "center",
                        boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                        border: "2px solid rgba(255,255,255,0.2)",
                        transform: "perspective(1000px) rotateX(1deg)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 36,
                          marginBottom: 8,
                          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                        }}
                      >
                        🏥
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: "#2563eb",
                        }}
                      >
                        {healthCheckups.length + confirmedHistory.length}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#1d4ed8",
                          fontWeight: 600,
                        }}
                      >
                        Tổng lần khám
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={4}>
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                        borderRadius: 18,
                        padding: "20px 0",
                        textAlign: "center",
                        boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                        border: "2px solid rgba(255,255,255,0.2)",
                        transform: "perspective(1000px) rotateX(1deg)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 36,
                          marginBottom: 8,
                          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                        }}
                      >
                        📅
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: "#2563eb",
                        }}
                      >
                        {appointments.length}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#2563eb",
                          fontWeight: 600,
                        }}
                      >
                        Lịch hẹn
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={4}>
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                        borderRadius: 18,
                        padding: "20px 0",
                        textAlign: "center",
                        boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                        border: "2px solid rgba(255,255,255,0.2)",
                        transform: "perspective(1000px) rotateX(1deg)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 36,
                          marginBottom: 8,
                          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                        }}
                      >
                        🕛
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: "#2563eb",
                        }}
                      >
                        {healthCheckups.length}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#2563eb",
                          fontWeight: 600,
                        }}
                      >
                        Chờ xác nhận
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={4}>
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                        borderRadius: 18,
                        padding: "20px 0",
                        textAlign: "center",
                        boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                        border: "2px solid rgba(255,255,255,0.2)",
                        transform: "perspective(1000px) rotateX(1deg)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 36,
                          marginBottom: 8,
                          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                        }}
                      >
                        ✔️
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: "#2563eb",
                        }}
                      >
                        {
                          confirmedHistory.filter((v) => {
                            const status = (v.Status || "").toLowerCase();
                            return (
                              status === "confirmed" ||
                              status === "đã xác nhận" ||
                              status === "approved" ||
                              status === "completed" ||
                              status === "hoàn thành"
                            );
                          }).length
                        }
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#2563eb",
                          fontWeight: 600,
                        }}
                      >
                        Đã xác nhận
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={4}>
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                        borderRadius: 18,
                        padding: "20px 0",
                        textAlign: "center",
                        boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                        border: "2px solid rgba(255,255,255,0.2)",
                        transform: "perspective(1000px) rotateX(1deg)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 36,
                          marginBottom: 8,
                          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                        }}
                      >
                        ❌
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: "#2563eb",
                        }}
                      >
                        {
                          confirmedHistory.filter((v) => {
                            const status = (v.Status || "").toLowerCase();
                            return (
                              status === "denied" ||
                              status === "từ chối" ||
                              status === "đã từ chối" ||
                              status === "rejected" ||
                              status === "cancelled"
                            );
                          }).length
                        }
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#2563eb",
                          fontWeight: 600,
                        }}
                      >
                        Từ chối
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Main Content with Tabs */}
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
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "16px",
                    color: "#1e293b",
                    display: "flex",
                    marginBottom: "4px",
                  }}
                >
                  Danh sách khám sức khỏe
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    fontWeight: "400",
                  }}
                >
                  Quản lý và theo dõi kết quả khám sức khỏe định kỳ của học sinh
                </Text>
              </div>
            </div>
            <div
              style={{
                width: "300px",
                marginLeft: "auto",
              }}
            >
              <Select
                placeholder="Chọn học sinh để xem thông tin khám sức khỏe"
                style={{ width: "100%" }}
                value={selectedStudentId}
                onChange={(value) => setSelectedStudentId(value)}
                loading={studentsLoading}
                showSearch
                optionFilterProp="children"
                allowClear
                size="middle"
              >
                {students.map((student) => (
                  <Option key={student.StudentID} value={student.StudentID}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: "16px" }}>👨‍🎓</span>
                      <div>
                        <span>{student.StudentName}</span>
                        <span>-</span>
                        <span style={{ color: "#64748b", marginLeft: 8 }}>
                          Lớp {student.Class}
                        </span>
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        }
        style={{
          borderRadius: "20px",
          border: "none",
          background: "white",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
        bodyStyle={{ padding: "0" }}
      >
        {!selectedStudentId ? (
          <div style={{ padding: "40px 24px" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text style={{ fontSize: "16px", color: "#8c8c8c" }}>
                    Vui lòng chọn học sinh để xem thông tin khám sức khỏe
                  </Text>
                  <br />
                  <Text style={{ fontSize: "14px", color: "#bfbfbf" }}>
                    Chọn một học sinh từ danh sách bên trên
                  </Text>
                </div>
              }
            />
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ padding: "24px 24px 0 24px" }}
            size="large"
            type="card"
            items={[
              {
                key: "waiting",
                label: (
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>
                    ⏳ Chờ xác nhận ({healthCheckups.length})
                  </span>
                ),
                children: (
                  <Table
                    columns={waitingColumns}
                    dataSource={healthCheckups}
                    rowKey="HealthCheckUpID"
                    loading={loading}
                    pagination={{
                      total: healthCheckups.length,
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} lần khám chờ xác nhận`,
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <div>
                              <Text
                                style={{ fontSize: "16px", color: "#8c8c8c" }}
                              >
                                Không có lần khám nào đang chờ xác nhận
                              </Text>
                              <br />
                              <Text
                                style={{ fontSize: "14px", color: "#bfbfbf" }}
                              >
                                Tất cả lần khám đã được xử lý
                              </Text>
                            </div>
                          }
                        />
                      ),
                    }}
                    scroll={{ x: 800 }}
                    style={{ borderRadius: "0 0 20px 20px" }}
                  />
                ),
              },
              {
                key: "history",
                label: (
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>
                    📋 Lịch sử khám ({confirmedHistory.length})
                  </span>
                ),
                children: (
                  <Table
                    columns={historyColumns}
                    dataSource={confirmedHistory}
                    rowKey="HealthCheckUpID"
                    loading={loading}
                    pagination={{
                      total: confirmedHistory.length,
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} lần khám trong lịch sử`,
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <div>
                              <Text
                                style={{ fontSize: "16px", color: "#8c8c8c" }}
                              >
                                Chưa có lịch sử khám sức khỏe
                              </Text>
                              <br />
                              <Text
                                style={{ fontSize: "14px", color: "#bfbfbf" }}
                              >
                                Lịch sử sẽ hiển thị sau khi có phản hồi từ phụ
                                huynh
                              </Text>
                            </div>
                          }
                        />
                      ),
                    }}
                    scroll={{ x: 800 }}
                    style={{ borderRadius: "0 0 20px 20px" }}
                  />
                ),
              },
              {
                key: "appointments",
                label: (
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>
                    📅 Lịch tư vấn ({appointments.length})
                  </span>
                ),
                children: (
                  <Table
                    columns={appointmentColumns}
                    dataSource={appointments}
                    rowKey="appointmentID"
                    loading={loading}
                    pagination={{
                      total: appointments.length,
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} lịch hẹn`,
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <div>
                              <Text
                                style={{ fontSize: "16px", color: "#8c8c8c" }}
                              >
                                Không có lịch hẹn nào
                              </Text>
                              <br />
                              <Text
                                style={{ fontSize: "14px", color: "#bfbfbf" }}
                              >
                                Lịch hẹn sẽ hiển thị khi có appointment được tạo
                                từ kết quả khám sức khỏe
                              </Text>
                            </div>
                          }
                        />
                      ),
                    }}
                    scroll={{ x: 1200 }}
                    style={{ borderRadius: "0 0 20px 20px" }}
                  />
                ),
              },
            ]}
          />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <HeartOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
            Chi tiết khám sức khỏe
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setViewingCheckup(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {viewingCheckup && (
          <div>
            {/* Main Information */}
            <Card
              title="Thông tin chính"
              size="small"
              style={{ marginBottom: "16px" }}
            >
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Mã khám" span={1}>
                  <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                    {viewingCheckup.HealthCheckUpID}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={1}>
                  {getStatusTag(viewingCheckup.Status)}
                </Descriptions.Item>

                <Descriptions.Item label="Tên học sinh" span={1}>
                  <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                    {viewingCheckup.StudentName || "Chưa có tên"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mã học sinh" span={1}>
                  <Text style={{ color: "#1890ff", fontSize: "14px" }}>
                    {viewingCheckup.StudentID}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Ngày khám" span={1}>
                  <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                    {formatDate(viewingCheckup.CheckDate)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Health Measurements */}
            <Card
              title="Thông số sức khỏe"
              size="small"
              style={{ marginBottom: "16px" }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Chiều cao">
                      <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                        {viewingCheckup.Height
                          ? `${viewingCheckup.Height} cm`
                          : "Chưa đo"}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Cân nặng">
                      <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                        {viewingCheckup.Weight
                          ? `${viewingCheckup.Weight} kg`
                          : "Chưa đo"}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="BMI">
                      <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                        {viewingCheckup.BMI
                          ? viewingCheckup.BMI.toFixed(1)
                          : "Chưa tính"}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Huyết áp">
                      <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                        {viewingCheckup.BloodPressure
                          ? `${viewingCheckup.BloodPressure} mmHg`
                          : "Chưa đo"}
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Thị lực mắt trái">
                      <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                        {viewingCheckup.VisionLeft
                          ? `${viewingCheckup.VisionLeft}/10`
                          : "Chưa kiểm tra"}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thị lực mắt phải">
                      <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                        {viewingCheckup.VisionRight
                          ? `${viewingCheckup.VisionRight}/10`
                          : "Chưa kiểm tra"}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Răng miệng">
                      <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                        {viewingCheckup.Dental || "Chưa kiểm tra"}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Da liễu">
                      <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                        {viewingCheckup.Skin || "Chưa kiểm tra"}
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            {/* Additional Checkups */}
            <Card
              title="Khám chuyên khoa"
              size="small"
              style={{ marginBottom: "16px" }}
            >
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Tai mũi họng">
                  <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                    {viewingCheckup.Hearing || "Chưa kiểm tra"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Hô hấp">
                  <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                    {viewingCheckup.Respiration || "Chưa kiểm tra"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tim mạch">
                  <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                    {viewingCheckup.Cardiovascular || "Chưa kiểm tra"}
                  </Text>
                </Descriptions.Item>

                {viewingCheckup.Notes && (
                  <Descriptions.Item label="Ghi chú của bác sĩ">
                    <Text
                      style={{
                        fontSize: "13px",
                        fontStyle: "italic",
                        color: "#1890ff",
                      }}
                    >
                      {viewingCheckup.Notes}
                    </Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Actions for pending checkups */}
            {(viewingCheckup.Status === "Pending" ||
              viewingCheckup.Status === "Not Response" ||
              viewingCheckup.Status === "pending" ||
              viewingCheckup.Status === "chờ xác nhận" ||
              viewingCheckup.Status === "not response" ||
              viewingCheckup.Status === "chưa phản hồi") && (
              <Card title="Thao tác" size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      block
                      onClick={() => {
                        handleConfirmHealthCheckup(
                          viewingCheckup.HealthCheckUpID
                        );
                        setIsDetailModalVisible(false);
                      }}
                    >
                      Xác nhận khám sức khỏe
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      block
                      onClick={() => {
                        handleDenyHealthCheckup(viewingCheckup.HealthCheckUpID);
                        setIsDetailModalVisible(false);
                      }}
                    >
                      Từ chối khám sức khỏe
                    </Button>
                  </Col>
                </Row>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Appointment Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <CalendarOutlined
              style={{ marginRight: "8px", color: "#1890ff" }}
            />
            Chi tiết lịch hẹn tư vấn
          </div>
        }
        open={isAppointmentDetailModalVisible}
        onCancel={() => {
          setIsAppointmentDetailModalVisible(false);
          setViewingAppointment(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => setIsAppointmentDetailModalVisible(false)}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {viewingAppointment && (
          <div>
            {/* Main Information */}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã lịch hẹn" span={1}>
                <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                  {viewingAppointment.AppointmentID ||
                    viewingAppointment.appointmentID ||
                    "Chưa có"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Lý do khám" span={1}>
                <Text style={{ fontSize: "14px", color: "#722ed1" }}>
                  {viewingAppointment.Reason ||
                    viewingAppointment.reason ||
                    "Không có lý do"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian hẹn" span={1}>
                <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                  {viewingAppointment.DateTime || viewingAppointment.dateTime
                    ? formatDateTime(
                        viewingAppointment.DateTime ||
                          viewingAppointment.dateTime
                      )
                    : "Chưa xác định"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm" span={1}>
                <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                  {viewingAppointment.Location ||
                    viewingAppointment.location ||
                    "Chưa xác định"}
                </Text>
              </Descriptions.Item>
            </Descriptions>
            {/* Related Health Checkup */}
            {viewingAppointment.HealthCheckup && (
              <Card
                title="Kết quả khám liên quan"
                size="small"
                style={{ marginBottom: "16px" }}
              >
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Mã khám" span={1}>
                    <Text code style={{ fontSize: "14px", color: "#1890ff" }}>
                      HC-{viewingAppointment.HealthCheckup.HealthCheckUpID}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày khám" span={1}>
                    <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                      {viewingAppointment.HealthCheckup.CheckDate
                        ? formatDate(viewingAppointment.HealthCheckup.CheckDate)
                        : "Chưa khám"}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Actions for pending appointments */}
            {canTakeAppointmentAction(viewingAppointment.Status) && (
              <Card title="Xác nhận tham gia" size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      block
                      style={{
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                      }}
                      onClick={() => {
                        handleConfirmAppointment(
                          viewingAppointment.AppointmentID
                        );
                        setIsAppointmentDetailModalVisible(false);
                      }}
                    >
                      Đồng ý tham gia
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      block
                      onClick={() => {
                        handleDeniedAppointment(
                          viewingAppointment.AppointmentID
                        );
                        setIsAppointmentDetailModalVisible(false);
                      }}
                    >
                      Từ chối tham gia
                    </Button>
                  </Col>
                </Row>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HealthResult;
