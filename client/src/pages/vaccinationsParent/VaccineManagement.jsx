import React, { useState, useEffect } from "react";
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
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import vaccineApi from "../../api/vaccineApi";
import studentApi from "../../api/studentApi";

const { Text } = Typography;
const { Option } = Select;

const VaccineManagement = () => {
  const [vaccines, setVaccines] = useState([]);
  const [vaccinatedHistory, setVaccinatedHistory] = useState([]); // Lịch sử đã tiêm
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [viewingVaccine, setViewingVaccine] = useState(null);
  const [activeTab, setActiveTab] = useState("waiting"); // Tab hiện tại

  // Student management states
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Component mount
  useEffect(() => {
    console.log("🚀 VaccineManagement component mounting...");
    fetchStudents();
  }, []);

  // Effect để tải vaccine khi selectedStudentId thay đổi
  useEffect(() => {
    if (selectedStudentId) {
      console.log("🔄 Học sinh đã thay đổi:", selectedStudentId);
      fetchVaccineData();
    }
  }, [selectedStudentId]);

  // ==================== API FUNCTIONS ====================

  const fetchStudents = async () => {
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
  };

  const fetchVaccineData = async () => {
    if (!selectedStudentId) {
      console.log("⚠️ Chưa chọn học sinh, không tải vaccine");
      return;
    }

    try {
      setLoading(true);
      console.log(
        "🔄 Đang lấy danh sách vaccine từ server cho học sinh:",
        selectedStudentId
      );

      const response = await vaccineApi.parent.getVaccineByParentId();
      console.log("✅ API getVaccineByParentId response:", response);

      const vaccineData = response.data || [];
      console.log("📋 Dữ liệu vaccine từ server:", vaccineData);

      if (Array.isArray(vaccineData)) {
        // Lọc vaccine theo học sinh đã chọn
        const filteredVaccines = vaccineData.filter((vaccine) => {
          const match =
            vaccine.studentID &&
            selectedStudentId &&
            vaccine.studentID.toString().toLowerCase() ===
              selectedStudentId.toString().toLowerCase();

          return match;
        });

        // Chuẩn hóa dữ liệu
        const normalizedVaccines = filteredVaccines.map((vaccine) => ({
          RecordID: vaccine.recordID,
          StudentID: vaccine.studentID,
          StudentName: vaccine.studentName,
          Class: vaccine.class,
          VaccineName: vaccine.vaccineName,
          Dose: vaccine.dose,
          VaccinatedAt: vaccine.vaccinatedAt,
          Status: vaccine.status,
          DateTime: vaccine.dateTime,
          VaccinatorName: vaccine.vaccinatorName,
          Notes: vaccine.notes,
          FollowUpNotes: vaccine.followUpNotes,
          FollowUpDate: vaccine.followUpDate,
          VaccineID: vaccine.vaccineID,
          VaccinatorID: vaccine.vaccinatorID,
          NurseID: vaccine.nurseID,
          ParentID: vaccine.parentID,
          vaccinatorName: vaccine.vaccinatorName,
        }));
        console.log("📋 Vaccine đã lọc theo học sinh:", normalizedVaccines);

        // 🎯 Phân loại vaccine cho "Kết quả tiêm chủng"
        // Tab "Chờ tiêm": Vaccine chưa hoàn thành (bao gồm cả mới tạo, đã tiêm, đang theo dõi)
        const waitingVaccines = normalizedVaccines.filter((vaccine) => {
          const status = (vaccine.Status || "").toLowerCase().trim();

          // ✅ Bao gồm tất cả status chưa hoàn thành
          const waitingStatuses = [
            "pending", // Chờ xác nhận (mới tạo từ nurse)
            "chờ xác nhận", // Chờ xác nhận (Vietnamese)
            "waiting", // Đang chờ
            "created", // Vừa tạo
            "new", // Mới
            "confirmed", // Parent đã đồng ý, chờ tiêm
            "đã xác nhận", // Parent đã đồng ý, chờ tiêm (Vietnamese)
            "approved", // Nurse đã chuẩn bị tiêm
            "injected", // Nurse đã tiêm (giai đoạn 1)
            "vaccinated", // Nurse đã tiêm (variant)
            "đã tiêm", // Nurse đã tiêm (Vietnamese)
            "monitoring", // Nurse đang theo dõi (giai đoạn 2)
            "đang theo dõi", // Nurse đang theo dõi (Vietnamese)
            "processing", // Đang xử lý
            "in_progress", // Đang tiến hành
            "scheduled", // Đã lên lịch
          ];

          return waitingStatuses.includes(status);
        });

        // Tab "Lịch sử tiêm": Chỉ những vaccine đã hoàn thành (nurse xác nhận) hoặc từ chối
        const completedVaccines = normalizedVaccines.filter((vaccine) => {
          const status = (vaccine.Status || "").toLowerCase().trim();

          const completedStatuses = [
            "completed", // Nurse xác nhận hoàn thành (giai đoạn 3) - English
            "hoàn thành", // ✅ QUAN TRỌNG: Backend trả về "Hoàn thành" (Vietnamese)
            "finish", // Hoàn thành (variant)
            "finished", // Hoàn thành (variant)
            "done", // Hoàn thành (variant)
            "success", // Hoàn thành (variant)
            "successful", // Hoàn thành (variant)
            "confirmed_complete", // Xác nhận hoàn thành (nếu có)
            "denied", // Parent đã từ chối
            "từ chối", // Từ chối (Vietnamese)
            "đã từ chối", // Đã từ chối (Vietnamese variant)
            "rejected", // Đã từ chối (variant)
            "cancel", // Đã hủy
            "cancelled", // Đã hủy (variant)
            "failed", // Thất bại
            "error", // Lỗi
          ];

          // 🚨 DEBUG: Log để kiểm tra status matching
          const isCompleted = completedStatuses.includes(status);
          if (
            (status && status.includes("hoàn")) ||
            status.includes("completed")
          ) {
            console.log(
              `🎯 COMPLETION CHECK: RecordID=${vaccine.RecordID}, Status="${vaccine.Status}", normalized="${status}", isCompleted=${isCompleted}`
            );
          }

          return isCompleted;
        });

        console.log("📋 Vaccine đã lọc theo học sinh:", filteredVaccines);
        console.log("🔍 Checking status của từng vaccine:");
        filteredVaccines.forEach((vaccine, index) => {
          console.log(
            `  ${index}: recordID=${vaccine.recordID}, status="${
              vaccine.status
            }" (type: ${typeof vaccine.status})`
          );
        });

        console.log("🔍 Checking normalized vaccine status:");
        normalizedVaccines.forEach((vaccine, index) => {
          console.log(
            `  ${index}: recordID=${vaccine.RecordID}, Status="${
              vaccine.Status
            }" (type: ${typeof vaccine.Status})`
          );
        });

        console.log("📊 Phân loại vaccine:");
        console.log(
          "  - Chờ tiêm (waitingVaccines):",
          waitingVaccines.map((v) => `${v.RecordID}:${v.Status}`)
        );
        console.log(
          "  - Lịch sử (completedVaccines):",
          completedVaccines.map((v) => `${v.RecordID}:${v.Status}`)
        );

        // 🚨 DEBUG: Kiểm tra vaccine không được phân loại
        const uncategorizedVaccines = normalizedVaccines.filter((vaccine) => {
          const status = (vaccine.Status || "").toLowerCase().trim();

          const waitingStatuses = [
            "pending",
            "chờ xác nhận",
            "waiting",
            "created",
            "new",
            "confirmed",
            "đã xác nhận",
            "approved",
            "injected",
            "vaccinated",
            "đã tiêm",
            "monitoring",
            "đang theo dõi",
            "processing",
            "in_progress",
            "scheduled",
          ];

          const completedStatuses = [
            "completed",
            "hoàn thành",
            "finish",
            "finished",
            "done",
            "success",
            "successful",
            "confirmed_complete",
            "denied",
            "từ chối",
            "đã từ chối",
            "rejected",
            "cancel",
            "cancelled",
            "failed",
            "error",
          ];

          return (
            !waitingStatuses.includes(status) &&
            !completedStatuses.includes(status)
          );
        });

        if (uncategorizedVaccines.length > 0) {
          console.warn("⚠️ VACCINE KHÔNG ĐƯỢC PHÂN LOẠI:");
          uncategorizedVaccines.forEach((vaccine) => {
            console.warn(
              `  - RecordID: ${vaccine.RecordID}, Status: "${
                vaccine.Status
              }" (normalized: "${(vaccine.Status || "").toLowerCase().trim()}")`
            );
          });
          console.warn("🔧 Cần thêm các status này vào logic phân loại!");
        }

        // Liệt kê tất cả status unique để debug
        const allOriginalStatuses = [
          ...new Set(filteredVaccines.map((v) => v.status)),
        ];
        const allNormalizedStatuses = [
          ...new Set(normalizedVaccines.map((v) => v.Status)),
        ];
        console.log("🏷️ Tất cả status gốc có trong data:", allOriginalStatuses);
        console.log(
          "🏷️ Tất cả status normalized có trong data:",
          allNormalizedStatuses
        );

        // 🚨 SPECIAL DEBUG: Phân tích từng giai đoạn của nurse
        console.log("🏥 NURSE STAGES ANALYSIS:");
        normalizedVaccines.forEach((vaccine, index) => {
          const status = (vaccine.Status || "").toLowerCase().trim();
          let nurseStage = "Unknown";

          if (
            ["pending", "chờ xác nhận", "waiting", "created", "new"].includes(
              status
            )
          ) {
            nurseStage = "📝 Vừa tạo - Chờ parent xác nhận";
          } else if (
            ["confirmed", "đã xác nhận", "approved"].includes(status)
          ) {
            nurseStage = "✅ Parent đã đồng ý - Chờ tiêm";
          } else if (["injected", "vaccinated", "đã tiêm"].includes(status)) {
            nurseStage = "💉 GIAI ĐOẠN 1: Nurse đã tiêm";
          } else if (["monitoring", "đang theo dõi"].includes(status)) {
            nurseStage = "👁️ GIAI ĐOẠN 2: Nurse đang theo dõi";
          } else if (
            [
              "completed",
              "hoàn thành",
              "finish",
              "finished",
              "done",
              "success",
              "successful",
            ].includes(status)
          ) {
            nurseStage = "🎯 GIAI ĐOẠN 3: Nurse xác nhận hoàn thành ✅"; // ✅ Đánh dấu rõ
          } else if (
            ["denied", "từ chối", "đã từ chối", "rejected"].includes(status)
          ) {
            nurseStage = "❌ Parent đã từ chối";
          }

          console.log(
            `  ${index}: ${vaccine.RecordID} | Status: "${vaccine.Status}" → ${nurseStage}`
          );
        });

        // 🚨 SPECIAL DEBUG: Tìm vaccines mà nurse đã mark là hoàn thành
        console.log("🚨 DEBUGGING NURSE COMPLETION STATUS:");
        filteredVaccines.forEach((vaccine, index) => {
          const originalStatus = (vaccine.status || "").toLowerCase();
          const isLikelyCompleted =
            originalStatus.includes("hoàn") ||
            originalStatus.includes("completed") ||
            originalStatus.includes("finish") ||
            originalStatus.includes("done") ||
            originalStatus.includes("success");
          if (isLikelyCompleted) {
            console.log(
              `  🎯 FOUND COMPLETION: recordID=${vaccine.recordID}, original="${vaccine.status}", normalized="${vaccine.Status}"`
            );
          }
        });

        // ✅ FINAL STATUS VERIFICATION: Kiểm tra vaccines có status "Hoàn thành" từ backend
        console.log("🔍 BACKEND STATUS VERIFICATION:");
        normalizedVaccines.forEach((vaccine, index) => {
          const originalStatus = vaccine.Status || "";
          const normalizedStatus = originalStatus.toLowerCase().trim();

          // Kiểm tra exact match với "Hoàn thành" từ backend
          if (
            originalStatus === "Hoàn thành" ||
            normalizedStatus === "hoàn thành"
          ) {
            console.log(
              `🎯 BACKEND COMPLETION DETECTED: RecordID=${vaccine.RecordID}, Status="${vaccine.Status}"`
            );
          }

          // Kiểm tra tất cả completion variants
          const completionVariants = [
            "completed",
            "hoàn thành",
            "finish",
            "finished",
            "done",
            "success",
            "successful",
          ];
          if (completionVariants.includes(normalizedStatus)) {
            console.log(
              `✅ COMPLETION VARIANT: RecordID=${vaccine.RecordID}, Status="${vaccine.Status}", normalized="${normalizedStatus}"`
            );
          }
        });

        // Test case-insensitive matching
        console.log("🧪 Testing case-insensitive filters:");
        normalizedVaccines.forEach((vaccine, index) => {
          const status = (vaccine.Status || "").toLowerCase();
          const isWaiting =
            status === "confirmed" ||
            status === "đã xác nhận" ||
            status === "approved" ||
            status === "injected" ||
            status === "vaccinated" ||
            status === "đã tiêm" ||
            status === "monitoring" ||
            status === "đang theo dõi";
          const isCompleted =
            status === "completed" ||
            status === "hoàn thành" || // ✅ QUAN TRỌNG: Backend status
            status === "finish" ||
            status === "finished" ||
            status === "done" ||
            status === "success" ||
            status === "successful" ||
            status === "denied" ||
            status === "từ chối" ||
            status === "đã từ chối" || // Đã từ chối (từ backend)
            status === "rejected" ||
            status === "cancel" ||
            status === "cancelled";

          // 🎯 Special case: Log vaccines với status "Hoàn thành"
          if (status === "hoàn thành" || vaccine.Status === "Hoàn thành") {
            console.log(
              `🎯 HOÀN THÀNH DETECTED: recordID=${vaccine.RecordID}, Status="${vaccine.Status}", normalized="${status}", isCompleted=${isCompleted}`
            );
          }

          console.log(
            `  ${index}: recordID=${vaccine.RecordID}, status="${vaccine.Status}" → normalized="${status}" → isWaiting=${isWaiting}, isCompleted=${isCompleted}`
          );
        });

        setVaccines(waitingVaccines);
        setVaccinatedHistory(completedVaccines);
      } else {
        console.warn("⚠️ Dữ liệu vaccine không phải array:", vaccineData);
        setVaccines([]);
        setVaccinatedHistory([]);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu vaccine:", error);
      message.error("Không thể tải danh sách tiêm chủng. Vui lòng thử lại!");
      setVaccines([]);
      setVaccinatedHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLER FUNCTIONS ====================

  const handleViewDetail = (record) => {
    console.log("👁️ Viewing vaccine detail:", record);
    setViewingVaccine(record);
    setIsDetailModalVisible(true);
  };

  const handleConfirmVaccination = async (record) => {
    try {
      console.log("✅ Confirming vaccination for record:", record.RecordID);

      const confirmData = {
        recordID: record.RecordID,
      };

      const response = await vaccineApi.parent.confirmVaccination(confirmData);
      console.log("✅ Confirm vaccination response:", response);

      message.success("Đã đồng ý tiêm vaccine thành công!");

      // Refresh data
      fetchVaccineData();
    } catch (error) {
      console.error("❌ Error confirming vaccination:", error);
      message.error("Không thể xác nhận đồng ý. Vui lòng thử lại!");
    }
  };

  const handleDenyVaccination = async (record) => {
    try {
      console.log("❌ Denying vaccination for record:", record.RecordID);

      const denyData = {
        recordID: record.RecordID,
      };

      const response = await vaccineApi.parent.denyVaccination(denyData);
      console.log("✅ Deny vaccination response:", response);

      message.success("Đã từ chối tiêm vaccine thành công!");

      // Refresh data
      fetchVaccineData();
    } catch (error) {
      console.error("❌ Error denying vaccination:", error);
      message.error("Không thể từ chối vaccine. Vui lòng thử lại!");
    }
  };

  const handleRefresh = () => {
    console.log("🔄 Refreshing data...");
    if (selectedStudentId) {
      fetchVaccineData();
    } else {
      fetchStudents();
    }
  };

  // ==================== HELPER FUNCTIONS ====================

  const getStatusTag = (status) => {
    const normalizedStatus = (status || "").toLowerCase().trim();

    const statusConfig = {
      // 🔵 Trạng thái chờ xử lý (mới tạo từ nurse)
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
      waiting: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Đang chờ",
      },
      created: {
        color: "cyan",
        icon: <ClockCircleOutlined />,
        text: "Vừa tạo",
      },
      new: {
        color: "cyan",
        icon: <ClockCircleOutlined />,
        text: "Mới",
      },

      // 🟦 Trạng thái đã xác nhận từ parent
      confirmed: {
        color: "blue",
        icon: <CheckCircleOutlined />,
        text: "Đã đồng ý - Chờ tiêm",
      },
      "đã xác nhận": {
        color: "blue",
        icon: <CheckCircleOutlined />,
        text: "Đã đồng ý - Chờ tiêm",
      },
      approved: {
        color: "purple",
        icon: <CheckCircleOutlined />,
        text: "Chuẩn bị tiêm",
      },

      // 🟡 Giai đoạn 1: Nurse đã tiêm (riêng biệt)
      injected: {
        color: "gold",
        icon: <SafetyCertificateOutlined />,
        text: "Đã tiêm",
      },
      vaccinated: {
        color: "gold",
        icon: <SafetyCertificateOutlined />,
        text: "Đã tiêm",
      },
      "đã tiêm": {
        color: "gold",
        icon: <SafetyCertificateOutlined />,
        text: "Đã tiêm",
      },

      // 🟣 Giai đoạn 2: Nurse đang theo dõi (riêng biệt)
      monitoring: {
        color: "geekblue",
        icon: <SafetyCertificateOutlined />,
        text: "Đang theo dõi",
      },
      "đang theo dõi": {
        color: "geekblue",
        icon: <SafetyCertificateOutlined />,
        text: "Đang theo dõi",
      },

      // 🟢 Giai đoạn 3: Nurse xác nhận hoàn thành
      completed: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      "hoàn thành": {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành", // ✅ QUAN TRỌNG: Backend trả về "Hoàn thành"
      },
      finish: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      finished: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      done: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      success: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      successful: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      confirmed_complete: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Xác nhận hoàn thành",
      },

      // 🔴 Trạng thái từ chối
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

    const config = statusConfig[normalizedStatus];

    if (!config) {
      // 🚨 DEBUG: Log unknown status
      console.warn(
        `⚠️ Unknown vaccine status: "${status}" (normalized: "${normalizedStatus}")`
      );

      return (
        <Tag color="magenta" icon={<ExclamationCircleOutlined />}>
          Unknown: {status || "N/A"}
        </Tag>
      );
    }

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

  // ==================== TABLE COLUMNS ====================

  // Columns cho tab "Chờ tiêm"
  const waitingColumns = [
    {
      title: "Mã tiêm",
      dataIndex: "RecordID",
      key: "RecordID",
      width: 120,
      render: (text) => (
        <Text strong className="text-blue-600 text-xs">
          {text || "N/A"}
        </Text>
      ),
    },
    {
      title: "Tên học sinh",
      key: "student",
      width: 200,
      render: (_, record) => (
        <div>
          <div>
            <Text className="font-medium text-xs text-blue-500">
              {record.StudentName || "Chưa có tên"}
            </Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Lớp: {record.Class || "Chưa phân lớp"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Loại vaccine",
      dataIndex: "VaccineName",
      key: "VaccineName",
      width: 150,
      render: (text, record) => (
        <div>
          <div className="font-medium text-purple-700 text-xs">
            {text || "Chưa xác định"}
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Liều: {record.Dose || "Chưa xác định"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Ngày dự kiến tiêm",
      dataIndex: "VaccinatedAt",
      key: "VaccinatedAt",
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
      title: "Trạng thái",
      dataIndex: "Status",
      key: "Status",
      width: 150,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => {
        const status = (record.Status || "").toLowerCase().trim();
        const needsParentResponse = [
          "pending",
          "waiting",
          "created",
          "new",
          "chờ xác nhận",
        ].includes(status);

        return (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
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

            {needsParentResponse && (
              <>
                <Tooltip title="Đồng ý tiêm vaccine">
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleConfirmVaccination(record)}
                    style={{
                      background: "#22c55e",
                      borderColor: "#22c55e",
                      fontSize: "11px",
                    }}
                  >
                    ✓ Đồng ý
                  </Button>
                </Tooltip>

                <Tooltip title="Từ chối tiêm vaccine">
                  <Button
                    danger
                    size="small"
                    onClick={() => handleDenyVaccination(record)}
                    style={{ fontSize: "11px" }}
                  >
                    ✗ Từ chối
                  </Button>
                </Tooltip>
              </>
            )}
          </div>
        );
      },
    },
  ]; // Columns cho lịch sử đã tiêm
  const historyColumns = [
    {
      title: "Mã tiêm",
      dataIndex: "RecordID",
      key: "RecordID",
      width: 120,
      render: (text) => (
        <Text strong className="text-blue-500 text-xs">
          {text || "N/A"}
        </Text>
      ),
    },
    {
      title: "Loại vaccine",
      dataIndex: "VaccineName",
      key: "VaccineName",
      width: 150,
      render: (_, record) => (
        <div>
          <div>
            <Text className="font-medium text-purple-700 text-xs">
              {record.VaccineName || "Chưa xác định"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Liều",
      dataIndex: "Dose",
      key: "Dose",
      width: 80,
      render: (dose) => (
        <Text strong className="text-blue-500 text-xs">
          Liều {dose || 1}
        </Text>
      ),
    },
    {
      title: "Ngày tiêm dự kiến",
      dataIndex: "VaccinatedAt",
      key: "VaccinatedAt",
      width: 120,
      render: (text) => (
        <Text className="text-xs font-medium" style={{ color: "black" }}>
          {formatDate(text)}
        </Text>
      ),
    },
    {
      title: "Người thực hiện",
      dataIndex: "VaccinatorName",
      key: "VaccinatorName",
      width: 150,
      render: (text, record) => (
        <Text>{text || record.vaccinatorName || "Chưa xác định"}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "Status",
      key: "Status",
      width: 140,
      render: (status) => getStatusTag(status), // Hiển thị đúng trạng thái thay vì cố định "Đã tiêm"
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
            stype={{ color: "blue" }}
          >
            Chi tiết
          </Button>
        </Tooltip>
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
          background: "linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)",
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
              background: "linear-gradient(135deg, #d1f4f9 0%, #80d0c7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 8px 24px rgba(128,208,199,0.25), inset 0 2px 4px rgba(255,255,255,0.3)",
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
              💉
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
              Quản lý tiêm chủng
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
                Chăm sóc sức khỏe toàn diện cho trẻ
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
              boxShadow: "0 2px 8px rgba(22,160,133,0.12)",
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 4 }}>
              <span role="img" aria-label="list">
                📋
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {vaccines.length + vaccinatedHistory.length}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Tổng số vaccine</div>
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
              boxShadow: "0 2px 8px rgba(22,160,133,0.12)",
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
                        💉
                      </span>
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                        Thống kê trạng thái tiêm chủng
                      </Text>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        Tổng quan về các vaccine theo trạng thái xử lý
                      </div>
                    </div>
                  </div>
                }
              >
                <Row gutter={24} justify="center">
                  <Col xs={12} md={5}>
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
                        💉
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: "#2563eb",
                        }}
                      >
                        {vaccines.length + vaccinatedHistory.length}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#1d4ed8",
                          fontWeight: 600,
                        }}
                      >
                        Tổng vaccine
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={5}>
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
                        {vaccines.length}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#1d4ed8",
                          fontWeight: 600,
                        }}
                      >
                        Chờ tiêm
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={5}>
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
                          vaccinatedHistory.filter((v) => {
                            const status = (v.Status || "").toLowerCase();
                            return (
                              status === "completed" ||
                              status === "hoàn thành" ||
                              status === "finish" ||
                              status === "finished" ||
                              status === "done" ||
                              status === "success" ||
                              status === "successful"
                            );
                          }).length
                        }
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#1d4ed8",
                          fontWeight: 600,
                        }}
                      >
                        Hoàn thành
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={5}>
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
                          vaccinatedHistory.filter((v) => {
                            const status = (v.Status || "").toLowerCase();
                            return (
                              status === "denied" ||
                              status === "từ chối" ||
                              status === "đã từ chối" ||
                              status === "rejected" ||
                              status === "cancel" ||
                              status === "cancelled"
                            );
                          }).length
                        }
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#1d4ed8",
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
                  Danh sách tiêm chủng vaccine
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    fontWeight: "400",
                  }}
                >
                  Quản lý và theo dõi tình trạng tiêm chủng vaccine của học sinh
                </Text>
              </div>
            </div>
            <div
              style={{
                width: "300px", // Giảm kích thước ô chọn học sinh
                marginLeft: "auto", // Đẩy ô về phía bên trái
              }}
            >
              <Select
                placeholder="Chọn học sinh để xem thông tin tiêm chủng"
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
          maxWidth: "1200px", // giảm chiều rộng
          margin: "0 auto", // Căn giữa nội dung
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
                    Vui lòng chọn học sinh để xem thông tin tiêm chủng
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
                    ⏳ Chờ tiêm ({vaccines.length})
                  </span>
                ),
                children: (
                  <Table
                    columns={waitingColumns}
                    dataSource={vaccines}
                    rowKey="RecordID"
                    loading={loading}
                    pagination={{
                      total: vaccines.length,
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} bản ghi chờ tiêm`,
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
                                Không có vaccine nào đang chờ tiêm
                              </Text>
                              <br />
                              <Text
                                style={{ fontSize: "14px", color: "#bfbfbf" }}
                              >
                                Tất cả vaccine đã được hoàn thành hoặc từ chối
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
                    📋 Lịch sử tiêm ({vaccinatedHistory.length})
                  </span>
                ),
                children: (
                  <Table
                    columns={historyColumns}
                    dataSource={vaccinatedHistory}
                    rowKey="RecordID"
                    loading={loading}
                    pagination={{
                      total: vaccinatedHistory.length,
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} bản ghi lịch sử`,
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
                                Chưa có lịch sử tiêm chủng
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
            ]}
          />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <SafetyCertificateOutlined
              style={{ marginRight: "8px", color: "#1890ff" }}
            />
            Chi tiết tiêm chủng
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setViewingVaccine(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {viewingVaccine && (
          <div>
            {/* Main Information */}
            <Card
              title="Thông tin chính"
              size="small"
              style={{ marginBottom: "16px" }}
            >
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Mã vaccine" span={1}>
                  <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                    {viewingVaccine.RecordID}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={1}>
                  {getStatusTag(viewingVaccine.Status)}
                </Descriptions.Item>

                <Descriptions.Item label="Tên học sinh" span={1}>
                  <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                    {viewingVaccine.StudentName || "Chưa có tên"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mã học sinh" span={1}>
                  <Text style={{ color: "#1890ff" }}>
                    {viewingVaccine.StudentID}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Lớp" span={1}>
                  <Text style={{ color: "#1890ff" }}>
                    {viewingVaccine.Class || "Chưa phân lớp"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại vaccine" span={1}>
                  <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                    {viewingVaccine.VaccineName || "Chưa xác định"}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Liều lượng" span={1}>
                  <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                    Liều {viewingVaccine.Dose || "Chưa xác định"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tiêm" span={1}>
                  <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                    {formatDate(viewingVaccine.VaccinatedAt)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Additional Information */}
            <Card
              title="Thông tin bổ sung"
              size="small"
              style={{ marginBottom: "16px" }}
            >
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Thời gian tạo yêu cầu">
                  <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                    {formatDateTime(viewingVaccine.DateTime)}
                  </Text>
                </Descriptions.Item>

                {viewingVaccine.VaccinatorName && (
                  <Descriptions.Item label="Người thực hiện tiêm">
                    <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                      {viewingVaccine.VaccinatorName}
                    </Text>
                  </Descriptions.Item>
                )}

                {viewingVaccine.Notes && (
                  <Descriptions.Item label="Ghi chú từ y tá">
                    <Text style={{ fontSize: "13px", fontStyle: "italic" }}>
                      {viewingVaccine.Notes}
                    </Text>
                  </Descriptions.Item>
                )}

                {viewingVaccine.FollowUpNotes && (
                  <Descriptions.Item label="Ghi chú theo dõi">
                    <Text style={{ fontSize: "13px", fontStyle: "italic" }}>
                      {viewingVaccine.FollowUpNotes}
                    </Text>
                  </Descriptions.Item>
                )}

                {viewingVaccine.FollowUpDate && (
                  <Descriptions.Item label="Ngày theo dõi">
                    <Text style={{ fontSize: "13px" }}>
                      {formatDate(viewingVaccine.FollowUpDate)}
                    </Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VaccineManagement;
