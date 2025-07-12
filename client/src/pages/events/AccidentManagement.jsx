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
  Radio,
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

  // Modal cập nhật sự cố y tế
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateForm] = Form.useForm();

  // Modal phóng to ảnh - nâng cao giống HealthCheckManagement
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageList, setImageList] = useState([]);

  // Đường dẫn gốc cho ảnh nếu chỉ có tên file
  const IMAGE_BASE_URL = "http://localhost:5000/uploads/";

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

  // API fetch data - giống như MedicationSubmission.jsx
  const fetchAllAccidents = async () => {
    setLoading(true);
    try {
      const response = await medicalEventApi.nurse.getAll();
      console.log("API response:", response.data);

      // 🔍 DEBUG: Kiểm tra format dữ liệu API trả về
      console.log("🔍 First item image:", response.data[0]?.image);
      console.log(
        "🔍 All image fields:",
        response.data.map((item) => item.image)
      );

      // Map dữ liệu cơ bản và ảnh trực tiếp từ getAll response
      const mappedData = response.data.map((item) => {
        // Xử lý ảnh theo format mới từ backend
        let accidentImages = [];

        if (item.image && Array.isArray(item.image)) {
          // Backend trả về format: image: [{ id, url, fileName, fileType, uploadedAt }]
          accidentImages = item.image
            .map((imageObj) => {
              if (imageObj && typeof imageObj === "object" && imageObj.url) {
                return imageObj.url;
              }
              return null;
            })
            .filter(Boolean);
        }

        console.log(
          `🖼️ Processed images for ${item.medicalEventID}:`,
          accidentImages
        );

        return {
          id: item.medicalEventID ?? item.id ?? "",
          key: item.medicalEventID ?? item.id ?? "",
          submissionCode: item.medicalEventID ?? item.id ?? "",
          studentId: Array.isArray(item.studentID)
            ? item.studentID[0]
            : item.studentID ?? "",
          studentName: item.studentName || "Chưa có tên",
          studentClass: item.class || "Chưa có lớp",
          date: item.eventDateTime ? item.eventDateTime.split("T")[0] : "",
          time: item.eventDateTime
            ? item.eventDateTime.split("T")[1]?.slice(0, 5)
            : "",
          location: item.location || "Chưa rõ",
          type: item.eventTypeID || item.eventTypeName || "Chưa rõ",
          severity: item.severity || "Chưa rõ",
          description: item.description || "",
          status: getStatusFromBackend(item.status),
          handledBy: item.nurseID || "Chưa rõ",
          treatment: item.actionTaken || "",
          followUp: item.notes || "",
          submissionDate: item.eventDateTime || "",
          accidentImages: accidentImages, // Sử dụng tên field khác để tránh conflict
        };
      });

      console.log("✅ Debug dữ liệu sau khi map và lấy ảnh:", mappedData);
      setAccidents(mappedData);
    } catch (error) {
      console.error("Lỗi fetch api:", error);
      message.error("Không thể tải danh sách sự cố. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAccidents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 🆕 Handle search function - sử dụng local filter giống MedicationSubmission
  const handleSearch = () => {
    // Search is handled in filteredAccidents filter logic
    console.log("🔍 Searching for:", searchText);
  };

  // Updated filter logic to use searchText for multi-field search (giống MedicationSubmission)
  const filteredAccidents = accidents.filter((accident) => {
    const matchesStatus =
      statusFilter === "all" || accident.status === statusFilter;
    const matchesClass =
      classFilter === "all" || accident.studentClass === classFilter;

    // Multi-field search: studentId, studentName, studentClass - Safe string conversion
    const search = searchText.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (accident.studentId &&
        String(accident.studentId).toLowerCase().includes(search)) ||
      (accident.studentName &&
        String(accident.studentName).toLowerCase().includes(search)) ||
      (accident.studentClass &&
        String(accident.studentClass).toLowerCase().includes(search));

    return matchesStatus && matchesClass && matchesSearch;
  });

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
          <Button
            type="default"
            icon={<CheckCircleOutlined />}
            size="small"
            onClick={() => handleUpdateAccident(record)}
            style={{ padding: "0 6px", fontSize: "12px" }}
          >
            Cập nhật
          </Button>
        </Space>
      ),
    },
  ];

  // Modal chi tiết - cập nhật giống như MedicationSubmission.jsx
  const handleViewDetails = async (accident) => {
    // 🆕 Gọi API chi tiết để lấy ảnh nếu chưa có hoặc cần refresh
    let accidentWithImages = { ...accident };

    if (!accident.accidentImages || accident.accidentImages.length === 0) {
      try {
        console.log(`🖼️ Fetching details for ${accident.id}...`);
        const detailResponse = await medicalEventApi.nurse.getByEventID(
          accident.id
        );
        console.log(
          `✅ Detail response for ${accident.id}:`,
          detailResponse.data
        );

        const item = detailResponse.data;
        let images = [];

        // Xử lý ảnh theo format mới từ backend
        if (item.image && Array.isArray(item.image)) {
          // Backend trả về format: image: [{ id, url, fileName, fileType, uploadedAt }]
          images = item.image
            .map((imageObj) => {
              if (imageObj && typeof imageObj === "object" && imageObj.url) {
                return imageObj.url;
              }
              return null;
            })
            .filter(Boolean);
        }

        console.log(
          `🖼️ Final images from detail API for ${accident.id}:`,
          images
        );
        accidentWithImages = { ...accident, accidentImages: images };
      } catch (error) {
        console.warn(`⚠️ Không thể lấy chi tiết cho ${accident.id}:`, error);
        // Vẫn hiển thị modal nhưng không có ảnh
      }
    }

    console.log("🔍 Debug dữ liệu accident:", accidentWithImages);
    console.log(
      "🖼️ Debug ảnh accident.accidentImages:",
      accidentWithImages.accidentImages
    );
    setSelectedAccident(accidentWithImages);
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
      // Chuyển fileList thành array file gốc - Xử lý cấu trúc Upload component giống MedicationSubmission.jsx
      console.log("🔍 CREATE DEBUG - values.image raw:", values.image);
      console.log("🔍 CREATE DEBUG - values.image type:", typeof values.image);

      let imageFiles = [];

      // Xử lý cấu trúc Upload component từ Ant Design
      if (values.image) {
        if (Array.isArray(values.image)) {
          // Trường hợp values.image là array
          imageFiles = values.image
            .map((fileObj) => fileObj.originFileObj || fileObj)
            .filter(Boolean);
        } else if (
          values.image.fileList &&
          Array.isArray(values.image.fileList)
        ) {
          // Trường hợp values.image có property fileList
          imageFiles = values.image.fileList
            .map((fileObj) => fileObj.originFileObj || fileObj)
            .filter(Boolean);
        } else if (values.image.originFileObj) {
          // Trường hợp values.image là single file object
          imageFiles = [values.image.originFileObj];
        }
      }

      console.log("🔍 CREATE DEBUG - imageFiles after processing:", imageFiles);

      const createData = {
        Description: values.description?.trim() || "Không có",
        ActionTaken: values.actionTaken?.trim() || "Không có",
        Notes: values.notes?.trim() || "Không có",
        EventType: values.eventType?.trim() || "Không có",
        StudentID: [values.studentID],
        Image: imageFiles, // Gửi array file gốc
      };

      console.log("🚀 Data gửi lên API:", createData);
      console.log("📁 Số lượng file ảnh:", imageFiles.length);

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

  // Hàm mở modal cập nhật
  const handleUpdateAccident = (accident) => {
    setSelectedAccident(accident);
    updateForm.setFieldsValue({
      description: accident.description,
      actionTaken: accident.treatment,
      notes: accident.followUp,
      eventType: accident.type,
      image: [],
      imageAction: "add", // Mặc định là thêm ảnh mới
    });
    setUpdateModalVisible(true);
  };

  // Hàm submit cập nhật
  const handleUpdateAccidentSubmit = async (values) => {
    try {
      // 🔧 Chuyển fileList thành array file gốc - Xử lý cấu trúc Upload component (giống MedicationSubmission.jsx)
      console.log("🔍 UPDATE DEBUG - values.image raw:", values.image);
      console.log("🔍 UPDATE DEBUG - values.image type:", typeof values.image);

      let imageFiles = [];

      // Xử lý cấu trúc Upload component từ Ant Design
      if (values.image) {
        if (Array.isArray(values.image)) {
          // Trường hợp values.image là array
          imageFiles = values.image
            .map((fileObj) => fileObj.originFileObj || fileObj)
            .filter(Boolean);
        } else if (
          values.image.fileList &&
          Array.isArray(values.image.fileList)
        ) {
          // Trường hợp values.image có property fileList
          imageFiles = values.image.fileList
            .map((fileObj) => fileObj.originFileObj || fileObj)
            .filter(Boolean);
        } else if (values.image.originFileObj) {
          // Trường hợp values.image là single file object
          imageFiles = [values.image.originFileObj];
        }
      }

      console.log("🔍 UPDATE DEBUG - imageFiles after processing:", imageFiles);
      console.log("🔍 UPDATE DEBUG - imageAction:", values.imageAction);

      const updateData = {
        Description: values.description?.trim() || "Không có",
        ActionTaken: values.actionTaken?.trim() || "Không có",
        Notes: values.notes?.trim() || "Không có",
        EventType: values.eventType?.trim() || "Không có",
      };

      // Logic xử lý ảnh dựa trên imageAction (giống MedicationSubmission.jsx)
      const imageAction = values.imageAction || "add";
      const hasImages = imageFiles.length > 0;

      if (hasImages && imageAction === "replace") {
        // THAY THẾ: Thêm Image vào updateData
        updateData.Image = imageFiles;
        console.log("🔄 Chế độ THAY THẾ: Thêm Image vào updateData");
      }

      console.log("🔄 Data cập nhật gửi lên API:", updateData);
      console.log("📁 Số lượng file ảnh bổ sung:", imageFiles.length);
      console.log("📝 Form values từ modal:", values);
      console.log("🔧 Image Action:", imageAction);
      console.log("🔧 Has Images:", hasImages);
      console.log("🆔 Medical Event ID for addImage API:", selectedAccident.id);

      // Kiểm tra ID hợp lệ trước khi gọi API
      if (
        !selectedAccident.id ||
        selectedAccident.id.toString().startsWith("TEST_")
      ) {
        message.error("ID sự cố không hợp lệ! Không thể cập nhật test data.");
        return;
      }

      // API Update
      await medicalEventApi.nurse.update(selectedAccident.id, updateData);

      // API AddImage
      if (hasImages && imageAction === "add") {
        await medicalEventApi.nurse.addImage(selectedAccident.id, imageFiles);
        console.log("Thêm ảnh mới thành công!");
      }

      fetchAllAccidents();

      // Success message dựa trên action
      let successMessage = "Cập nhật sự cố thành công!";
      if (hasImages) {
        if (imageAction === "replace") {
          successMessage += ` Đã thay thế bằng ${imageFiles.length} ảnh mới.`;
        } else {
          successMessage += ` Đã thêm ${imageFiles.length} ảnh mới.`;
        }
      }

      message.success(successMessage);
      setUpdateModalVisible(false);
      updateForm.resetFields();
    } catch (err) {
      console.error("❌ Lỗi cập nhật sự cố:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);

      if (err.code === "ECONNABORTED") {
        message.error("Kết nối tới server bị timeout! Vui lòng thử lại.");
      } else if (err.response?.status === 400) {
        const validationErrors =
          err.response?.data?.errors || err.response?.data?.message;
        if (validationErrors) {
          message.error(
            `Validation Error: ${JSON.stringify(validationErrors)}`
          );
        } else {
          message.error("Dữ liệu gửi lên không hợp lệ! Vui lòng kiểm tra lại.");
        }
      } else if (err.response?.status === 404) {
        message.error("Không tìm thấy sự cố cần cập nhật!");
      } else if (err.response?.status === 500) {
        message.error("Lỗi server! Vui lòng liên hệ admin.");
      } else if (!err.response) {
        message.error("Không thể kết nối tới server! Kiểm tra kết nối mạng.");
      } else {
        message.error("Cập nhật sự cố thất bại! Vui lòng thử lại.");
      }
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
          <Row
            gutter={[24, 16]}
            style={{ textAlign: "center", justifyContent: "center" }}
          >
            <Col xs={24} sm={12} md={4}>
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
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#b45309",
                  }}
                >
                  {accidents.filter((a) => a.status === "pending").length}
                </Text>
                <Text
                  strong
                  style={{
                    fontSize: "18px",
                    color: "#92400e",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Tổng sự cố
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={12} md={4}>
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
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#2563eb",
                  }}
                >
                  {accidents.filter((a) => a.status === "processing").length}
                </Text>
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
              </div>
            </Col>

            <Col xs={24} sm={12} md={4}>
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
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#16a34a",
                  }}
                >
                  {accidents.filter((a) => a.status === "completed").length}
                </Text>
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
              </div>
            </Col>

            <Col xs={24} sm={12} md={4}>
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
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#dc2626",
                  }}
                >
                  {accidents.filter((a) => a.status === "transferred").length}
                </Text>
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
              </div>
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
          bodyStyle={{ padding: "32px" }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              padding: "16px 20px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Row gutter={[12, 12]} align="middle">
              {/* Trạng thái - Compact */}
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ marginBottom: "6px" }}>
                  <Text
                    strong
                    style={{
                      fontSize: "13px",
                      color: "#1e40af",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
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
                    <span style={{ fontSize: "13px", color: "#666" }}>
                      📋 Tất cả
                    </span>
                  </Option>
                  {statuses.map((status) => (
                    <Option key={status} value={status}>
                      <span style={{ fontSize: "13px" }}>
                        {status === "pending"
                          ? "⏳ Chờ xử lý"
                          : status === "processing"
                          ? "🔄 Đang xử lý"
                          : status === "completed"
                          ? "✅ Đã xử lý"
                          : status === "transferred"
                          ? "🏥 Đã chuyển viện"
                          : "📋"}
                      </span>
                    </Option>
                  ))}
                </Select>
              </Col>
              {/* Lớp học - Compact */}
              <Col xs={24} sm={12} md={8} lg={5}>
                <div style={{ marginBottom: "6px" }}>
                  <Text
                    strong
                    style={{
                      fontSize: "13px",
                      color: "#7c2d12",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
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
                    <span style={{ fontSize: "13px", color: "#666" }}>
                      🎓 Tất cả
                    </span>
                  </Option>
                  {classes.map((cls) => (
                    <Option key={cls} value={cls}>
                      <span style={{ fontSize: "13px" }}>📚 Lớp {cls}</span>
                    </Option>
                  ))}
                </Select>
              </Col>
              {/* Tìm kiếm học sinh */}
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
                    👤 <span>Tìm kiếm</span>
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
                    🔍
                  </Button>
                </Input.Group>
              </Col>
              {/* Thời gian cập nhật - Compact */}
              <Col xs={24} sm={24} md={24} lg={5}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: { xs: "center", lg: "flex-end" },
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 16px",
                      background:
                        "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                      borderRadius: "12px",
                      border: "1px solid #bfdbfe",
                      textAlign: "center",
                      boxShadow: "0 3px 8px rgba(59, 130, 246, 0.12)",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      minWidth: "130px",
                    }}
                  >
                    <div style={{ fontSize: "16px", marginBottom: "4px" }}>
                      🕒
                    </div>
                    <Text
                      style={{
                        color: "#1e40af",
                        fontSize: "11px",
                        fontWeight: "600",
                        display: "block",
                      }}
                    >
                      Cập nhật lúc
                    </Text>
                    <div
                      style={{
                        fontSize: "10px",
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

        {/* 📋 Bảng danh sách sự cố */}
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
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
                  Thêm sự cố mới
                </Button>
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
            <>
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
              </Descriptions>
              <Descriptions
                column={2}
                bordered={false}
                size="middle"
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginTop: 16,
                }}
              >
                <Descriptions.Item label="Mô tả" span={2}>
                  <Text>{selectedAccident.description || "Chưa có mô tả"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Xử lý" span={2}>
                  <Text>
                    {selectedAccident.treatment || "Chưa có thông tin xử lý"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Theo dõi" span={2}>
                  <Text>{selectedAccident.followUp || ""}</Text>
                </Descriptions.Item>
              </Descriptions>
              {/* Khung hiển thị nhiều ảnh, mỗi dòng 3 ảnh, đặt ở dưới cùng */}
              <div
                style={{
                  margin: "24px 0 0 0",
                  padding: 16,
                  background: "#f9fafb",
                  borderRadius: 14,
                  border: "1px solid #eee",
                  minHeight: 120,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "#722ed1",
                    fontSize: "16px",
                  }}
                >
                  Ảnh sự cố y tế
                </div>
                {selectedAccident.accidentImages &&
                selectedAccident.accidentImages.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: 12,
                      maxWidth: "400px",
                    }}
                  >
                    {selectedAccident.accidentImages.map((img, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: "120px",
                          height: "90px",
                          borderRadius: 8,
                          border: "2px solid #e5e7eb",
                          overflow: "hidden",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          background: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "scale(1.05)";
                          e.target.style.borderColor = "#10b981";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scale(1)";
                          e.target.style.borderColor = "#e5e7eb";
                        }}
                        onClick={() => {
                          // 🆕 Nâng cao: Thiết lập danh sách ảnh và index hiện tại
                          setImageList(selectedAccident.accidentImages);
                          setCurrentImageIndex(idx);
                          setPreviewImage(img);
                          setPreviewTitle(
                            `Ảnh sự cố ${idx + 1}/${
                              selectedAccident.accidentImages.length
                            }`
                          );
                          setImagePreviewVisible(true);
                        }}
                      >
                        <img
                          src={img}
                          alt={`Ảnh sự cố ${idx + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.parentElement.innerHTML =
                              '<div style="color: #999; font-size: 12px; text-align: center;">Ảnh lỗi</div>';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      border: "2px dashed #d1d5db",
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                      📷
                    </div>
                    <Text type="secondary">Không có ảnh sự cố</Text>
                  </div>
                )}
              </div>
            </>
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
                multiple
                maxCount={5}
                accept="image/*"
                listType="picture-card"
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                  showDownloadIcon: false,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                    📷
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Chọn ảnh
                  </div>
                </div>
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

        {/* Modal cập nhật sự cố y tế */}
        <Modal
          title="Cập nhật sự cố y tế"
          open={updateModalVisible}
          onCancel={() => setUpdateModalVisible(false)}
          footer={null}
          width={600}
          style={{ borderRadius: "20px" }}
          destroyOnClose
        >
          <Form
            form={updateForm}
            layout="vertical"
            onFinish={handleUpdateAccidentSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Mô tả sự cố"
              name="description"
              rules={[
                { required: true, message: "Vui lòng nhập mô tả sự cố!" },
              ]}
            >
              <Input.TextArea placeholder="Mô tả chi tiết sự cố" rows={3} />
            </Form.Item>
            <Form.Item
              label="Xử lý ban đầu"
              name="actionTaken"
              rules={[
                { required: true, message: "Vui lòng nhập xử lý ban đầu!" },
              ]}
            >
              <Input.TextArea
                placeholder="Các biện pháp xử lý ban đầu"
                rows={2}
              />
            </Form.Item>
            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea placeholder="Ghi chú thêm (nếu có)" rows={2} />
            </Form.Item>
            <Form.Item
              label="Loại sự cố"
              name="eventType"
              rules={[{ required: true, message: "Vui lòng nhập loại sự cố!" }]}
            >
              <Input placeholder="Nhập loại sự cố (ví dụ: đau, ngã, sốt...)" />
            </Form.Item>

            {/* Hiển thị ảnh hiện tại nếu có */}
            {selectedAccident?.accidentImages &&
              selectedAccident.accidentImages.length > 0 && (
                <Form.Item label="Ảnh hiện tại">
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {selectedAccident.accidentImages.map((imageUrl, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        <img
                          src={imageUrl}
                          alt={`Current ${index + 1}`}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid #d9d9d9",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setPreviewImage(imageUrl);
                            setPreviewTitle(`Ảnh sự cố ${index + 1}`);
                            setImageList(selectedAccident.accidentImages);
                            setCurrentImageIndex(index);
                            setImagePreviewVisible(true);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    📸 Ảnh hiện tại. Chọn "Thêm ảnh" để giữ nguyên hoặc "Thay
                    thế" để xóa hết.
                  </Text>
                </Form.Item>
              )}

            {/* Tùy chọn xử lý ảnh */}
            <Form.Item
              label="Tùy chọn ảnh"
              name="imageAction"
              initialValue="add"
            >
              <Radio.Group>
                <Radio value="add">➕ Thêm ảnh mới (giữ ảnh cũ)</Radio>
                <Radio value="replace">🔄 Thay thế toàn bộ ảnh</Radio>
              </Radio.Group>
            </Form.Item>

            {/* Trường upload ảnh mới */}
            <Form.Item
              label="Hình ảnh bổ sung"
              name="image"
              help="Chọn ảnh để thêm vào hoặc thay thế (tùy theo lựa chọn bên trên)"
              valuePropName="fileList"
              getValueFromEvent={(e) =>
                Array.isArray(e) ? e : e && e.fileList
              }
            >
              <Upload
                beforeUpload={() => false}
                multiple
                maxCount={5}
                accept="image/*"
                listType="picture-card"
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                  showDownloadIcon: false,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                    📷
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Thêm ảnh
                  </div>
                </div>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: "100%",
                  height: 44,
                  fontWeight: 600,
                  borderRadius: 10,
                }}
              >
                Cập nhật sự cố
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal phóng to ảnh - nâng cao với navigation và zoom */}
        <Modal
          open={imagePreviewVisible}
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>🖼️</span>
                </div>
                <Text strong style={{ fontSize: "16px" }}>
                  {previewTitle}
                </Text>
              </div>
              {imageList.length > 1 && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Button
                    type="text"
                    icon="⬅️"
                    size="small"
                    disabled={currentImageIndex === 0}
                    onClick={() => {
                      const newIndex = currentImageIndex - 1;
                      setCurrentImageIndex(newIndex);
                      setPreviewImage(imageList[newIndex]);
                      setPreviewTitle(
                        `Ảnh sự cố ${newIndex + 1}/${imageList.length}`
                      );
                    }}
                    style={{
                      borderRadius: "6px",
                      background:
                        currentImageIndex === 0 ? "#f5f5f5" : "#e6f7ff",
                      border: "1px solid #d9d9d9",
                    }}
                  >
                    Trước
                  </Button>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      minWidth: "40px",
                      textAlign: "center",
                    }}
                  >
                    {currentImageIndex + 1}/{imageList.length}
                  </Text>
                  <Button
                    type="text"
                    icon="➡️"
                    size="small"
                    disabled={currentImageIndex === imageList.length - 1}
                    onClick={() => {
                      const newIndex = currentImageIndex + 1;
                      setCurrentImageIndex(newIndex);
                      setPreviewImage(imageList[newIndex]);
                      setPreviewTitle(
                        `Ảnh sự cố ${newIndex + 1}/${imageList.length}`
                      );
                    }}
                    style={{
                      borderRadius: "6px",
                      background:
                        currentImageIndex === imageList.length - 1
                          ? "#f5f5f5"
                          : "#e6f7ff",
                      border: "1px solid #d9d9d9",
                    }}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </div>
          }
          footer={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button
                type="default"
                onClick={() => setImagePreviewVisible(false)}
                style={{
                  borderRadius: "6px",
                }}
              >
                Đóng
              </Button>
            </div>
          }
          onCancel={() => setImagePreviewVisible(false)}
          width="90%"
          style={{ top: 20 }}
          centered
          bodyStyle={{
            padding: "20px",
            textAlign: "center",
            maxHeight: "70vh",
            overflow: "auto",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <img
              alt="preview"
              style={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
              src={previewImage}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML =
                  '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background: #fff; border-radius: 12px; border: 2px dashed #d9d9d9; color: #999; min-width: 400px; min-height: 300px;">' +
                  '<div style="font-size: 48px; margin-bottom: 16px;">📷</div>' +
                  '<div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">Không thể tải ảnh</div>' +
                  '<div style="font-size: 12px; color: #666;">URL: ' +
                  previewImage +
                  "</div>" +
                  "</div>";
              }}
              onClick={(e) => {
                //  Zoom effect on click - cải thiện zoom
                if (e.target.style.transform === "scale(1.3)") {
                  e.target.style.transform = "scale(1)";
                  e.target.style.cursor = "zoom-in";
                } else {
                  e.target.style.transform = "scale(1.3)"; //Giảm zoom từ 1.5 -> 1.3 để không bị cắt
                  e.target.style.cursor = "zoom-out";
                }
              }}
            />

            {/*  Navigation arrows on image */}
            {imageList.length > 1 && (
              <>
                <Button
                  type="primary"
                  shape="circle"
                  icon="⬅️"
                  size="large"
                  disabled={currentImageIndex === 0}
                  onClick={() => {
                    const newIndex = currentImageIndex - 1;
                    setCurrentImageIndex(newIndex);
                    setPreviewImage(imageList[newIndex]);
                    setPreviewTitle(
                      `Ảnh sự cố ${newIndex + 1}/${imageList.length}`
                    );
                  }}
                  style={{
                    position: "absolute",
                    left: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.6)",
                    borderColor: "rgba(0,0,0,0.6)",
                    color: "white",
                    fontSize: "16px",
                    width: "48px",
                    height: "48px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon="➡️"
                  size="large"
                  disabled={currentImageIndex === imageList.length - 1}
                  onClick={() => {
                    const newIndex = currentImageIndex + 1;
                    setCurrentImageIndex(newIndex);
                    setPreviewImage(imageList[newIndex]);
                    setPreviewTitle(
                      `Ảnh sự cố ${newIndex + 1}/${imageList.length}`
                    );
                  }}
                  style={{
                    position: "absolute",
                    right: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.6)",
                    borderColor: "rgba(0,0,0,0.6)",
                    color: "white",
                    fontSize: "16px",
                    width: "48px",
                    height: "48px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                />
              </>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
