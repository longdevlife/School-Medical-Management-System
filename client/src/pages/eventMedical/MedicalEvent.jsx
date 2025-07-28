import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  message,
  Alert,
  Modal,
  Descriptions,
  Select,
  Input,
  Image,
  Empty,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import medicalEventApi from "../../api/medicalEventApi";
import studentApi from "../../api/studentApi";
import useAutoRefresh from "../../hooks/useAutoRefresh";

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const MedicalEvent = () => {
  console.log("🔄 [RENDER] MedicalEvent component đang render...");

  // States
  const [medicalEvents, setMedicalEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log(
    "📊 [RENDER] Current medicalEvents state:",
    medicalEvents.length,
    "items"
  );
  console.log("📊 [RENDER] Current students state:", students.length, "items");

  // Modal states
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Image modal states - giống MedicineManagement.jsx
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [allImages, setAllImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Filter states
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(""); // Bộ lọc học sinh

  // Hàm lấy dữ liệu sự kiện y tế từ API
  const fetchMedicalEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🚀 Đang tải sự kiện y tế từ API...");
      console.log("🔗 Base URL:", "https://localhost:7040/api/");
      console.log(
        "🔗 Full URL:",
        "https://localhost:7040/api/parent/event/getByStudentId"
      );

      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token) {
        console.error("❌ Không có JWT token!");
        message.error("Vui lòng đăng nhập lại");
        return;
      }

      console.log("🔑 Token exists:", !!token);
      console.log("🔑 Token sample:", token.substring(0, 50) + "...");

      // Decode token để xem payload (chỉ để debug)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("👤 Token payload:", payload);
        console.log(
          "👤 User role:",
          payload.role ||
          payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ]
        );
        console.log(
          "👤 Username:",
          payload.unique_name || payload.sub || payload.name
        );
      } catch (e) {
        console.warn("⚠️ Cannot decode token:", e);
      }

      // Gọi API để lấy dữ liệu sự kiện y tế
      const response = await medicalEventApi.parent.getMedicalEvents();
      const data = response.data;

      console.log("📥 Dữ liệu sự kiện y tế từ API:", data);
      console.log("📊 Kiểu dữ liệu:", typeof data);
      console.log("📊 Là array?:", Array.isArray(data));
      console.log("📊 Độ dài:", data?.length);

      // DEBUG: Log chi tiết cấu trúc dữ liệu
      if (data && data.length > 0) {
        console.log("🔍 [DEBUG] Cấu trúc item đầu tiên:", data[0]);
        console.log(
          "🔍 [DEBUG] Tất cả keys của item đầu tiên:",
          Object.keys(data[0])
        );
        console.log(
          "🔍 [DEBUG] Sample data structure:",
          JSON.stringify(data[0], null, 2)
        );
      }

      // DEBUG: Kiểm tra từng điều kiện
      console.log("🔍 [CONDITION CHECK] data exists:", !!data);
      console.log("🔍 [CONDITION CHECK] is array:", Array.isArray(data));
      console.log("🔍 [CONDITION CHECK] length > 0:", data?.length > 0);
      console.log(
        "🔍 [CONDITION CHECK] final check:",
        data && Array.isArray(data) && data.length > 0
      );

      // Sửa logic: Kiểm tra data có phải array và có length không
      if (Array.isArray(data) && data.length > 0) {
        console.log("✅ API trả về dữ liệu hợp lệ, đang map dữ liệu...");

        // Map dữ liệu từ backend format sang frontend format
        const mappedEvents = data.map((item, index) => {
          console.log(`🔄 [MAPPING] Item ${index + 1}:`, item);

          // StudentID mapping - backend trả về array
          const studentIDRaw = Array.isArray(item.studentID)
            ? item.studentID[0]
            : item.studentID;
          const studentID = String(studentIDRaw).trim();

          // Images mapping - backend field là "image" không phải "images"
          const images = item.image || [];
          console.log(`📸 [IMAGES] Item ${index + 1} images:`, images);

          const mapped = {
            MedicalEventID: item.medicalEventID || `TEMP_${index + 1}`,
            EventDateTime: item.eventDateTime || new Date().toISOString(),
            Description: item.description || "Không có mô tả",
            ActionTaken: item.actionTaken || "Chưa xử lý",
            Notes: item.notes || "",
            EventTypeID: item.eventTypeID || "Không xác định",
            NurseID: item.nurseID || "",
            StudentID: studentID,
            StudentName: item.studentName || "Chưa có tên",
            StudentClass: item.class || "Chưa có lớp",
            Images: images, // Backend field là "image"
          };

          console.log(`✅ [MAPPING] Mapped item ${index + 1}:`, mapped);
          return mapped;
        });

        console.log("📋 [MAPPING] Tất cả dữ liệu đã map:", mappedEvents);

        console.log(
          "🔄 [STATE] Setting medicalEvents state với:",
          mappedEvents.length,
          "items"
        );
        setMedicalEvents(mappedEvents);
        console.log("✅ [STATE] State đã được set");

        console.log(`Đã tải ${mappedEvents.length} sự kiện y tế từ server`);
      } else {
        console.log(
          "⚠️ [ELSE BRANCH] Parent API trả về dữ liệu trống hoặc không hợp lệ"
        );
        console.log("� [ELSE DEBUG] Data value:", data);
        console.log("� [ELSE DEBUG] Data type:", typeof data);
        console.log("� [ELSE DEBUG] Is array:", Array.isArray(data));
        console.log("� [ELSE DEBUG] Length:", data?.length);

        message.info(
          "Không có sự kiện y tế nào từ server, hiển thị dữ liệu mẫu"
        );
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu sự kiện y tế:", error);
      console.error("📛 Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config,
      });

      // Log thêm thông tin về authentication
      if (error.response?.status === 401) {
        console.error(
          "🔒 Authentication Error - Token có thể hết hạn hoặc không hợp lệ"
        );
        message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      } else if (error.response?.status === 403) {
        console.error("🚫 Authorization Error - Không có quyền truy cập");
        message.error("Không có quyền truy cập chức năng này");
      } else if (error.response?.status === 404) {
        console.error("🔍 Not Found - API endpoint không tồn tại");
        message.error("API không tồn tại");
      } else {
        message.error("Lỗi kết nối server, hiển thị dữ liệu mẫu");
      }

      setError("Không thể tải dữ liệu sự kiện y tế từ server");
      // Không set empty array, giữ nguyên mock data
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách học sinh của phụ huynh
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      console.log("🔄 [STUDENTS] Đang lấy danh sách học sinh của phụ huynh...");

      const response = await studentApi.parent.getMyChildren();
      console.log("✅ [STUDENTS] API getMyChildren response:", response);

      const studentsData = response.data || [];

      if (Array.isArray(studentsData) && studentsData.length > 0) {
        const processedStudents = studentsData.map((student, index) => {
          // DEBUG StudentID mapping cho students
          const studentIDRaw =
            student.studentID || student.StudentID || student.id;
          const studentID = String(studentIDRaw).trim(); // Đảm bảo là string và loại bỏ khoảng trắng

          console.log(`👶 [STUDENT MAPPING] Student ${index + 1}:`);
          console.log(`  - Raw student.studentID:`, student.studentID);
          console.log(`  - Raw student.StudentID:`, student.StudentID);
          console.log(`  - Raw student.id:`, student.id);
          console.log(`  - studentIDRaw:`, studentIDRaw);
          console.log(`  - Final StudentID:`, studentID);
          console.log(`  - StudentID type:`, typeof studentID);
          console.log(`  - StudentID length:`, studentID.length);

          return {
            StudentID: studentID,
            StudentName:
              student.studentName ||
              student.StudentName ||
              student.name ||
              "Học sinh",
            Class:
              student.class ||
              student.className ||
              student.ClassName ||
              student.grade ||
              "Chưa phân lớp",
            Age: student.age || 0,
            Sex: student.sex || student.gender || "Chưa xác định",
            Birthday: student.birthday || student.dob || null,
          };
        });

        console.log("📋 Danh sách học sinh đã xử lý:", processedStudents);
        console.log(
          "🔍 [STUDENTS] All StudentIDs:",
          processedStudents.map((s) => s.StudentID)
        );
        setStudents(processedStudents);
        console.log(`Đã tải ${processedStudents.length} học sinh`);
      } else {
        console.log("⚠️ Không có học sinh nào");
        setStudents([]);
        message.info("Không có học sinh nào trong hệ thống");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách học sinh:", error);
      message.error("Không thể tải danh sách học sinh");

    } finally {
      setStudentsLoading(false);
    }
  };

  // Auto refresh mỗi 30 giây
  useAutoRefresh(fetchMedicalEvents, 10000);

  useEffect(() => {
    const initializeData = async () => {
      console.log("🚀 Khởi tạo component MedicalEvent");
      console.log("🔑 Current token:", localStorage.getItem("token"));
      console.log(
        "🔑 Current refresh token:",
        localStorage.getItem("refreshToken")
      );


      // Sau đó thử tải dữ liệu thực từ API
      try {
        console.log("🌐 Bắt đầu gọi Parent API...");

        console.log("📞 [1/2] Gọi fetchStudents...");
        await fetchStudents();
        console.log("✅ [1/2] fetchStudents hoàn thành");

        console.log("📞 [2/2] Gọi fetchMedicalEvents...");
        await fetchMedicalEvents();
        console.log("✅ [2/2] fetchMedicalEvents hoàn thành");

        console.log("✅ Hoàn thành gọi API");
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu:", error);
        console.error("📛 Error stack:", error.stack);
        // Giữ nguyên mock data nếu API lỗi
      }
    };

    initializeData();
  }, []);

  // Filter functions
  const getEventTypeColor = (eventType) => {
    const colors = {
      "Đau đầu": "orange",
      "Chấn thương": "red",
      Sốt: "volcano",
      "Dị ứng": "purple",
      Khác: "default",
    };
    return colors[eventType] || "default";
  };

  // Handle view detail
  const handleViewDetail = (event) => {
    setSelectedEvent(event);
    setIsDetailModalVisible(true);
  };

  // Handle image modal - giống MedicineManagement.jsx
  const openImageModal = (
    imageUrl,
    title = "Hình ảnh sự kiện y tế",
    allImageUrls = [],
    index = 0
  ) => {
    setCurrentImageUrl(imageUrl);
    setImageTitle(title);
    setAllImages(allImageUrls);
    setCurrentImageIndex(index);
    setImageModalVisible(true);
  };

  const closeImageModal = useCallback(() => {
    setImageModalVisible(false);
    setCurrentImageUrl("");
    setImageTitle("");
    setAllImages([]);
    setCurrentImageIndex(0);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % allImages.length;
      setCurrentImageUrl(allImages[newIndex]);
      return newIndex;
    });
  }, [allImages]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? allImages.length - 1 : prevIndex - 1;
      setCurrentImageUrl(allImages[newIndex]);
      return newIndex;
    });
  }, [allImages]);

  // Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (imageModalVisible && allImages.length > 1) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevImage();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          nextImage();
        } else if (e.key === "Escape") {
          e.preventDefault();
          closeImageModal();
        }
      }
    };

    if (imageModalVisible) {
      document.addEventListener("keydown", handleKeyPress);
      return () => {
        document.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [
    imageModalVisible,
    allImages.length,
    nextImage,
    prevImage,
    closeImageModal,
  ]);

  // Filter medical events based on filters
  const filteredEvents = medicalEvents.filter((event) => {
    const matchesEventType =
      !eventTypeFilter || event.EventTypeID === eventTypeFilter;

    // DEBUG: Chi tiết so sánh StudentID
    if (selectedStudentId) {
      console.log(`🔍 [FILTER DETAIL] Checking event ${event.MedicalEventID}:`);
      console.log(
        `  - Event StudentID: "${event.StudentID
        }" (type: ${typeof event.StudentID})`
      );
      console.log(
        `  - Selected StudentID: "${selectedStudentId}" (type: ${typeof selectedStudentId})`
      );
      console.log(
        `  - String comparison: "${String(event.StudentID)}" === "${String(
          selectedStudentId
        )}"`
      );
      console.log(
        `  - Direct comparison: ${event.StudentID === selectedStudentId}`
      );
      console.log(
        `  - String comparison result: ${String(event.StudentID) === String(selectedStudentId)
        }`
      );
    }

    // Sử dụng String() để đảm bảo so sánh đúng kiểu dữ liệu
    const matchesStudent =
      !selectedStudentId ||
      String(event.StudentID) === String(selectedStudentId);

    const result = matchesEventType && matchesStudent;

    if (selectedStudentId) {
      console.log(`  - Final match result: ${result}`);
    }

    return result;
  });

  // DEBUG: Log filter results
  console.log(
    "🔍 [FILTER DEBUG] Medical events before filter:",
    medicalEvents.length
  );
  console.log(
    "🔍 [FILTER DEBUG] Available StudentIDs in events:",
    medicalEvents.map((e) => e.StudentID)
  );
  console.log(
    "🔍 [FILTER DEBUG] Available StudentIDs in students:",
    students.map((s) => s.StudentID)
  );
  console.log(
    "🔍 [FILTER DEBUG] Filtered events count:",
    filteredEvents.length
  );
  console.log("🔍 [FILTER DEBUG] Event type filter:", eventTypeFilter);
  console.log("🔍 [FILTER DEBUG] Student filter:", selectedStudentId);
  console.log("🔍 [FILTER DEBUG] Filtered results:", filteredEvents);

  // Table columns configuration
  const columns = [
    {
      title: "Mã sự kiện",
      dataIndex: "MedicalEventID",
      key: "MedicalEventID",
      width: 120,
      render: (text) => (
        <Text strong style={{ color: "#1890ff", fontSize: "12px" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Học sinh",
      key: "student",
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: "14px" }}>
            {record.StudentName}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.StudentID} - Lớp {record.StudentClass}
          </Text>
        </div>
      ),
    },
    {
      title: "Loại sự kiện",
      dataIndex: "EventTypeID",
      key: "EventTypeID",
      width: 120,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: "13px", color: "#722ed1" }}>
            {record.EventTypeID}
          </Text>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "EventDateTime",
      key: "EventDateTime",
      width: 150,
      render: (datetime) => (
        <div style={{ fontSize: "12px" }}>
          <div>{dayjs(datetime).format("DD/MM/YYYY")}</div>
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {dayjs(datetime).format("HH:mm")}
          </Text>
        </div>
      ),
    },
   
    {
      title: "Ảnh sự kiện",
      key: "images",
      width: 80,
      render: (_, record) => {
        const images = record.Images || [];
        if (!Array.isArray(images) || images.length === 0) {
          return (
            <div className="text-center">
              <span className="text-gray-400 text-xs">Không có</span>
            </div>
          );
        }

        // Tạo array URL từ images
        const imageUrls = images.map((img) => img.url || img.imageUrl || "");

        return (
          <div className="text-center">
            <div className="inline-flex items-center gap-1">
              <img
                src={imageUrls[0]}
                alt="Ảnh sự kiện"
                className="w-8 h-8 object-cover rounded cursor-pointer border"
                onClick={() =>
                  openImageModal(
                    imageUrls[0],
                    `Ảnh sự kiện ${record.MedicalEventID}`,
                    imageUrls,
                    0
                  )
                }
                onError={(e) => {
                  e.target.src =
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN...";
                }}
              />
              {images.length > 1 && (
                <span className="text-blue-600 text-xs font-medium ml-1">
                  +{images.length - 1}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record)}
          style={{ padding: "0 4px", fontSize: "12px" }}
        >
          Chi tiết
        </Button>
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
              background: "linear-gradient(135deg, #d1f4f9 0%, #80d0c7 100%)", // xanh nhạt đến xanh teal
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 8px 24px rgba(128,208,199,0.25), inset 0 2px 4px rgba(255,255,255,0.3)", // hiệu ứng ánh sáng nhẹ
              border: "2px solid rgba(255,255,255,0.4)",
              backdropFilter: "blur(2px)", // hiệu ứng kính mờ nhẹ
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
              Sự kiện y tế của con
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
                Theo dõi tình trạng sức khỏe của con tại trường
              </span>
            </div>
          </div>
        </div>
        {/* Right: Tổng sự kiện + Ngày */}
        <div style={{ display: "flex", gap: 18 }}>
          {/* Tổng sự kiện */}
          <div
            style={{
              background: "rgba(255,255,255,0.13)",
              borderRadius: 18,
              padding: "18px 28px",
              minWidth: 90,
              textAlign: "center",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(127,90,240,0.09)",
            }}
          >
            <div
              style={{
                fontSize: 26,
                marginBottom: 4,
                filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.2))",
              }}
            >
              <span role="img" aria-label="medical">
                📋
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {medicalEvents.length}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Sự kiện</div>
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
              boxShadow: "0 2px 8px rgba(127,90,240,0.09)",
            }}
          >
            <div
              style={{
                fontSize: 26,
                marginBottom: 4,
                filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.2))",
              }}
            >
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

      {/* Filters & Statistics + Table + Modals */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Summary Cards */}
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
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                    }}
                  >
                    <span style={{ color: "white", fontSize: 20 }}>📊</span>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                      Thống kê sự kiện y tế
                    </Text>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      Tổng quan về các sự kiện y tế theo loại
                    </div>
                  </div>
                </div>
              }
            >
              <Row gutter={24} justify="center">
                {/* Tổng sự kiện */}
                <Col xs={12} md={4}>
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
                        fontSize: 32,
                        marginBottom: 8,
                        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))",
                        transform: "perspective(100px) rotateX(10deg)",
                      }}
                    >
                      📋
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#2563eb",
                      }}
                    >
                      {filteredEvents.length}
                      {console.log(
                        "🎯 [SUMMARY] Filtered events count:",
                        filteredEvents.length
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#1d4ed8",
                        fontWeight: 600,
                      }}
                    >
                      Tổng sự kiện
                    </div>
                  </div>
                </Col>

                {/* Tai nạn */}
                <Col xs={12} md={4}>
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
                        fontSize: 32,
                        marginBottom: 8,
                        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))",
                        transform: "perspective(100px) rotateX(10deg)",
                      }}
                    >
                      ⚠️
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#2563eb",
                      }}
                    >
                      {
                        filteredEvents.filter(
                          (e) =>
                            e.EventTypeID === "Tai nạn" ||
                            e.EventTypeID === "Chấn thương"
                        ).length
                      }
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#1d4ed8",
                        fontWeight: 600,
                      }}
                    >
                      Tai nạn
                    </div>
                  </div>
                </Col>

                {/* Cấp cứu */}
                <Col xs={12} md={4}>
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
                        fontSize: 32,
                        marginBottom: 8,
                        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))",
                        transform: "perspective(100px) rotateX(10deg)",
                      }}
                    >
                      🚑
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#2563eb",
                      }}
                    >
                      {
                        filteredEvents.filter(
                          (e) =>
                            e.EventTypeID === "Cấp cứu" ||
                            e.EventTypeID === "Khẩn cấp"
                        ).length
                      }
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#1d4ed8",
                        fontWeight: 600,
                      }}
                    >
                      Cấp cứu
                    </div>
                  </div>
                </Col>

                {/* Chấn thương */}
                <Col xs={12} md={4}>
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
                        fontSize: 32,
                        marginBottom: 8,
                        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))",
                        transform: "perspective(100px) rotateX(10deg)",
                      }}
                    >
                      🤕
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#2563eb",
                      }}
                    >
                      {
                        filteredEvents.filter(
                          (e) => e.EventTypeID === "Chấn thương"
                        ).length
                      }
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#1d4ed8",
                        fontWeight: 600,
                      }}
                    >
                      Chấn thương
                    </div>
                  </div>
                </Col>

                {/* Bệnh tật */}
                <Col xs={12} md={4}>
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
                        fontSize: 32,
                        marginBottom: 8,
                        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))",
                        transform: "perspective(100px) rotateX(10deg)",
                      }}
                    >
                      🤒
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#2563eb",
                      }}
                    >
                      {
                        filteredEvents.filter(
                          (e) =>
                            e.EventTypeID === "Sốt" ||
                            e.EventTypeID === "Đau đầu" ||
                            e.EventTypeID === "Bệnh tật"
                        ).length
                      }
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#1d4ed8",
                        fontWeight: 600,
                      }}
                    >
                      Bệnh tật
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Error message */}
        {error && (
          <Alert
            message="Lỗi khi tải dữ liệu"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: "16px" }}
            action={
              <Button size="small" type="primary" onClick={fetchMedicalEvents}>
                Thử lại
              </Button>
            }
          />
        )}

        {/* Filter and Search */}
        <Card
          style={{
            marginBottom: "16px",
            borderRadius: 16,
            border: "none",
            boxShadow: "0 4px 16px rgba(127,90,240,0.08), 0 0 0 1px #f3f4f6",
          }}
          bodyStyle={{ padding: "20px 24px" }}
        >
          <Row gutter={16} align="middle" justify="center">
            <Col xs={24} sm={10}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 18, color: "#e11d48" }}>🔄</span>
                <span style={{ fontWeight: 600, color: "#334155" }}>
                  Trạng thái
                </span>
              </div>
              <Select
                placeholder="Chọn trạng thái sự kiện"
                value={eventTypeFilter}
                onChange={setEventTypeFilter}
                allowClear
                style={{ width: "100%" }}
              >
                <Option value="Tai nạn"> Tai nạn</Option>
                <Option value="Cấp cứu"> Cấp cứu</Option>
                <Option value="Chấn thương"> Chấn thương</Option>
                <Option value="Bệnh tật">Bệnh tật</Option>
              </Select>
            </Col>
            <Col xs={24} sm={10}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 18, color: "#0ea5e9" }}>🎓</span>
                <span style={{ fontWeight: 600, color: "#334155" }}>
                  Học sinh
                </span>
              </div>
              <Select
                placeholder="Chọn học sinh"
                value={selectedStudentId}
                onChange={(value) => {
                  console.log("🔄 [SELECT CHANGE] Student selection changed:");
                  console.log(
                    `  - New selected value: "${value}" (type: ${typeof value})`
                  );
                  console.log(`  - Previous value: "${selectedStudentId}"`);
                  console.log("🔄 [SELECT] Available students:", students);
                  console.log(
                    "🔄 [SELECT] Available medical events:",
                    medicalEvents
                  );
                  console.log(
                    "🔄 [SELECT] StudentIDs in events:",
                    medicalEvents.map((e) => e.StudentID)
                  );
                  setSelectedStudentId(value);
                }}
                allowClear
                style={{ width: "100%" }}
                loading={studentsLoading}
              >
                {students.map((student) => {
                  console.log(
                    "🔍 [SELECT OPTION] Rendering student option:",
                    student
                  );
                  return (
                    <Option key={student.StudentID} value={student.StudentID}>
                      {student.StudentName} - Lớp {student.Class}
                    </Option>
                  );
                })}
              </Select>
            </Col>
            <Col xs={24} sm={4}></Col>
          </Row>
        </Card>

        {/* Main Table */}
        <Card
          style={{
            borderRadius: 16,
            border: "none",
            boxShadow: "0 4px 16px rgba(127,90,240,0.08), 0 0 0 1px #f3f4f6",
          }}
          bodyStyle={{ padding: "24px" }}
          title={
            <div className="flex items-center justify-between">
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{ fontSize: 18, fontWeight: 600, color: "#1e293b" }}
                >
                  Danh sách sự kiện y tế
                </span>
                <Text
                  className="text-sm text-gray-500"
                  style={{ display: "flex", marginTop: 2 }}
                >
                  Tổng cộng: {filteredEvents.length} sự kiện
                </Text>
              </span>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredEvents}
            rowKey="MedicalEventID"
            loading={loading}
            size="small"
            pagination={{
              total: filteredEvents.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} sự kiện`,
              pageSize: 10,
              pageSizeOptions: ["10", "20", "50"],
            }}
            locale={{
              emptyText: loading ? (
                "Đang tải..."
              ) : (
                <div className="text-center py-8">
                  <div style={{ fontSize: 64, marginBottom: 16 }}>🏥</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#6b7280",
                      marginBottom: 8,
                    }}
                  >
                    Chưa có sự kiện y tế nào
                  </div>
                  <div style={{ fontSize: 14, color: "#9ca3af" }}>
                    {medicalEvents.length === 0
                      ? "Hiện tại chưa có sự kiện y tế nào được ghi nhận"
                      : "Không tìm thấy sự kiện phù hợp với bộ lọc"}
                  </div>
                </div>
              ),
            }}
            scroll={{ x: 800 }}
            bordered
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <HistoryOutlined
                style={{ marginRight: "8px", color: "#1890ff" }}
              />
              <span style={{ fontWeight: 700, fontSize: "16px" }}>
                Chi tiết sự cố y tế
              </span>
            </div>
          }
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setIsDetailModalVisible(false)}
              style={{ borderRadius: "6px", fontWeight: 500 }}
            >
              Đóng
            </Button>,
          ]}
          width={900}
          bodyStyle={{ padding: "20px 24px" }}
          style={{ top: 20 }}
        >
          {" "}
          {selectedEvent && (
            <div>
              {/* Main Information */}
              <Card
                title="Thông tin chính"
                size="small"
                style={{ marginBottom: "16px" }}
              >
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Mã sự kiện" span={1}>
                    <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                      {selectedEvent.MedicalEventID}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại sự kiện" span={1}>
                    <Tag color={getEventTypeColor(selectedEvent.EventTypeID)}>
                      {selectedEvent.EventTypeID}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Tên học sinh" span={1}>
                    <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                      {selectedEvent.StudentName || "Chưa có tên"}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã học sinh" span={1}>
                    <Text style={{ color: "#1890ff" }}>
                      {selectedEvent.StudentID}
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Lớp" span={1}>
                    <Text style={{ color: "#1890ff" }}>
                      {selectedEvent.StudentClass || "Chưa phân lớp"}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian sự kiện" span={1}>
                    <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                      {dayjs(selectedEvent.EventDateTime).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </Text>
                  </Descriptions.Item>

                  {selectedEvent.NurseID && (
                    <Descriptions.Item label="Y tá phụ trách" span={2}>
                      <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                        {selectedEvent.NurseID}
                      </Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Additional Information */}
              <Card
                title="Thông tin bổ sung"
                size="small"
                style={{ marginBottom: "16px" }}
              >
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Thời gian xảy ra">
                    <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                      {dayjs(selectedEvent.EventDateTime).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {dayjs(selectedEvent.EventDateTime).fromNow()}
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Mô tả sự kiện">
                    <Text
                      style={{
                        fontSize: "13px",
                        fontStyle: "italic",
                        color: "#1890ff",
                      }}
                    >
                      {selectedEvent.Description}
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Xử lý đã thực hiện">
                    <Text
                      style={{
                        fontSize: "13px",
                        fontStyle: "italic",
                        color: "#1890ff",
                      }}
                    >
                      {selectedEvent.ActionTaken}
                    </Text>
                  </Descriptions.Item>

                  {selectedEvent.Notes && (
                    <Descriptions.Item label="Ghi chú từ y tá">
                      <Text
                        style={{
                          fontSize: "13px",
                          fontStyle: "italic",
                          color: "#1890ff",
                        }}
                      >
                        {selectedEvent.Notes}
                      </Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Images Section */}
              {selectedEvent.Images &&
                Array.isArray(selectedEvent.Images) &&
                selectedEvent.Images.length > 0 && (
                  <Card
                    title="Hình ảnh đính kèm"
                    size="small"
                    style={{ marginBottom: "16px" }}
                  >
                    <Row gutter={[16, 16]}>
                      {selectedEvent.Images.map((image, index) => {
                        // Tạo array URL cho navigation
                        const imageUrls = selectedEvent.Images.map(
                          (img) => img.url || img.imageUrl || ""
                        );

                        return (
                          <Col
                            xs={24}
                            sm={12}
                            md={8}
                            lg={6}
                            key={image.id || image.imageID || index}
                          >
                            <div
                              style={{
                                border: "1px solid #d9d9d9",
                                borderRadius: "8px",
                                padding: "8px",
                                background: "#fafafa",
                              }}
                            >
                              <img
                                src={
                                  image.url ||
                                  image.imageUrl ||
                                  `/api/files/medical-events/${image.fileName}`
                                }
                                alt={`Hình ảnh sự kiện ${selectedEvent.MedicalEventID
                                  } - ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "120px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  openImageModal(
                                    image.url ||
                                    image.imageUrl ||
                                    `/api/files/medical-events/${image.fileName}`,
                                    `Ảnh sự kiện ${selectedEvent.MedicalEventID
                                    } - ${index + 1}`,
                                    imageUrls,
                                    index
                                  )
                                }
                                onError={(e) => {
                                  e.target.src =
                                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN...";
                                }}
                              />
                              <div
                                style={{
                                  marginTop: "8px",
                                  fontSize: "12px",
                                  color: "#666",
                                }}
                              >
                                <Text ellipsis style={{ display: "block" }}>
                                  {image.fileName || `Ảnh ${index + 1}`}
                                </Text>
                                {image.uploadedAt && (
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "11px" }}
                                  >
                                    {dayjs(image.uploadedAt).format(
                                      "DD/MM/YYYY HH:mm"
                                    )}
                                  </Text>
                                )}
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>

                    {/* Fallback message if no images can be displayed */}
                    {selectedEvent.Images.length === 0 && (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có hình ảnh nào được đính kèm"
                        style={{ margin: "20px 0" }}
                      />
                    )}
                  </Card>
                )}
            </div>
          )}
        </Modal>

        {/* Image Modal - giống MedicineManagement.jsx với navigation buttons */}
        <Modal
          title={imageTitle}
          open={imageModalVisible}
          onCancel={closeImageModal}
          footer={[
            <Button key="close" onClick={closeImageModal}>
              Đóng
            </Button>,
          ]}
          width={800}
          centered
          zIndex={2000}
          style={{ zIndex: 2000 }}
          maskStyle={{ zIndex: 1999 }}
        >
          {allImages.length > 0 && currentImageUrl && (
            <div style={{ textAlign: "center", position: "relative" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Image
                  src={currentImageUrl}
                  alt={`Ảnh sự kiện y tế ${currentImageIndex + 1}`}
                  style={{ maxWidth: "100%", maxHeight: "60vh" }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN..."
                />

                {/* Navigation buttons overlay */}
                {allImages.length > 1 && (
                  <>
                    {/* Previous button */}
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<span style={{ fontSize: "18px" }}>‹</span>}
                      onClick={prevImage}
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "40px",
                        height: "40px",
                        background: "rgba(0, 0, 0, 0.6)",
                        border: "none",
                        color: "white",
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2100,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(0, 0, 0, 0.8)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(0, 0, 0, 0.6)";
                      }}
                    />

                    {/* Next button */}
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<span style={{ fontSize: "18px" }}>›</span>}
                      onClick={nextImage}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "40px",
                        height: "40px",
                        background: "rgba(0, 0, 0, 0.6)",
                        border: "none",
                        color: "white",
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2100,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(0, 0, 0, 0.8)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(0, 0, 0, 0.6)";
                      }}
                    />
                  </>
                )}
              </div>

              <div
                style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}
              >
                <Text>
                  Ảnh {currentImageIndex + 1}/{allImages.length}
                </Text>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MedicalEvent;
