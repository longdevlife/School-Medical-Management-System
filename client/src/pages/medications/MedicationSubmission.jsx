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
  Radio,
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
import useAutoRefresh from "../../hooks/useAutoRefresh";

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
  const [searchText, setSearchText] = useState(""); // 🆕 Search text for multi-field search
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

  // moodal phóng to ảnh
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // 🆕 Navigation và zoom cho image modal
  const [imageList, setImageList] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

      // Map dữ liệu cơ bản và ảnh trực tiếp từ getAll response
      const mappedData = response.data.map((item) => {
        let images = [];

        // Debug chi tiết các trường có thể chứa ảnh
        console.log(
          "🔍 Debugging all possible image fields for",
          item.medicineID
        );
        console.log("📋 item.image:", item.image);
        console.log("📋 item.file:", item.file);
        console.log("📋 item.files:", item.files);
        console.log("📋 Full item:", item); // 🆕 Debug toàn bộ object

        // ✅ Mapping ảnh theo đúng cấu trúc backend response mới nhất
        if (item.image && Array.isArray(item.image) && item.image.length > 0) {
          images = item.image
            .map((imageData) => {
              // Lấy url từ backend response mới
              const link = imageData.url;
              if (link && typeof link === "string" && link.startsWith("http")) {
                console.log(`✅ Found image URL from 'image' field: ${link}`);
                return link;
              }
              return null;
            })
            .filter(Boolean);
        }
        // Fallback cho cấu trúc cũ với 'file' field
        else if (
          item.file &&
          Array.isArray(item.file) &&
          item.file.length > 0
        ) {
          images = item.file
            .map((fileData) => {
              // Lấy fileLink từ backend response cũ
              const link = fileData.fileLink;
              if (link && typeof link === "string" && link.startsWith("http")) {
                console.log(`✅ Found image URL from 'file' field: ${link}`);
                return link;
              }
              return null;
            })
            .filter(Boolean);
        }
        // Fallback cho các trường khác (backward compatibility)
        else if (item.files && Array.isArray(item.files)) {
          images = item.files
            .map((fileData) => {
              const link =
                fileData.FileLink || fileData.fileLink || fileData.file_link;
              if (link && typeof link === "string" && link.startsWith("http"))
                return link;
              if (typeof fileData === "string" && fileData.startsWith("http"))
                return fileData;
              return null;
            })
            .filter(Boolean);
        } else if (
          item.fileLink &&
          typeof item.fileLink === "string" &&
          item.fileLink.startsWith("http")
        ) {
          images = [item.fileLink];
        } else if (Array.isArray(item.images)) {
          images = item.images
            .map((img) =>
              typeof img === "string"
                ? img.startsWith("http")
                  ? img
                  : null
                : img.FileLink || img.fileLink || img.file_link || null
            )
            .filter(Boolean);
        }

        console.log(`🖼️ Final images for ${item.medicineID}:`, images);

        return {
          id: item.medicineID,
          key: item.medicineID,
          submissionCode: item.medicineID,
          studentId: item.studentID, // ✅ Map từ API
          studentName: item.studentName || "Chưa có tên",
          studentClass: item.class || "Chưa có lớp",
          medicationName: item.medicineName,
          dosage: item.dosage,
          instructions: item.instructions,
          reason: "Chưa có",
          quantity: item.quantity,
          status: getStatusFromBackend(item.status),
          submissionDate: item.sentDate,
          verifiedBy: item.nurseID || null,
          verifiedDate: null,
          verificationNotes: item.notes,
          urgencyLevel: "normal",
          medicationImages: images,
          prescriptionImage: null,
          parentSignature: null,
          administrationTimes: [],
          parentId: item.parentID,
          createdBy: item.parentID
            ? "parent"
            : item.status === "Chờ xử lý"
            ? "parent"
            : "nurse",
        };
      });

      console.log("✅ Debug dữ liệu sau khi map và lấy ảnh:", mappedData);
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

  const handleViewDetails = async (submission) => {
    // 🆕 Gọi API chi tiết để lấy ảnh nếu chưa có
    let submissionWithImages = { ...submission };

    if (
      !submission.medicationImages ||
      submission.medicationImages.length === 0
    ) {
      try {
        console.log(`🔍 Fetching images for medicine ${submission.id}...`);
        const detailResponse = await medicineApi.nurse.getById(submission.id);
        const detailData = detailResponse.data;

        console.log("📋 Detail API response for modal:", detailData);

        // Mapping ảnh từ API chi tiết
        if (
          detailData.image &&
          Array.isArray(detailData.image) &&
          detailData.image.length > 0
        ) {
          const images = detailData.image
            .map((imageData) => {
              const link = imageData.url;
              if (link && typeof link === "string" && link.startsWith("http")) {
                console.log(`✅ Found image URL for modal: ${link}`);
                return link;
              }
              return null;
            })
            .filter(Boolean);

          submissionWithImages.medicationImages = images;
          console.log(`🖼️ Updated images for modal:`, images);
        }
      } catch (error) {
        console.warn(`⚠️ Could not fetch images for ${submission.id}:`, error);
      }
    }

    setSelectedSubmission(submissionWithImages);
    setDetailModalVisible(true);
  };

  // Tạo mới thuốc
  const handleCreateMedicine = async (values) => {
    try {
      let imageFiles = [];

      // Xử lý cấu trúc Upload component từ Ant Design
      if (values.image) {
        if (Array.isArray(values.image)) {
          imageFiles = values.image
            .map((fileObj) => fileObj.originFileObj || fileObj)
            .filter(Boolean);
        } else if (
          values.image.fileList &&
          Array.isArray(values.image.fileList)
        ) {
          imageFiles = values.image.fileList
            .map((fileObj) => fileObj.originFileObj || fileObj)
            .filter(Boolean);
        } else if (values.image.originFileObj) {
          imageFiles = [values.image.originFileObj];
        }
      }

      console.log("🔍 CREATE DEBUG - imageFiles after processing:", imageFiles);

      const createData = {
        MedicineName: values.medicineName,
        Quantity: values.quantity,
        Dosage: values.dosage,
        Instructions: values.instructions,
        StudentID: values.studentId,
        Status: "Chờ xử lý",
        Image: imageFiles,
      };

      console.log("🚀 Data gửi lên API:", createData);
      console.log("📁 Số lượng file ảnh:", imageFiles.length);
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
      // Chuyển fileList thành array file gốc - Xử lý cấu trúc Upload component
      console.log("🔍 UPDATE PROGRESS DEBUG - values.image raw:", values.image);

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

      console.log(
        "🔍 UPDATE PROGRESS DEBUG - imageFiles after processing:",
        imageFiles
      );

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

      // CHỈ thêm Image khi thực sự có ảnh mới
      if (imageFiles.length > 0) {
        updateData.Image = imageFiles;
      }

      console.log("🚀 Update Progress - JSON Data gửi lên API:", updateData);
      console.log("📁 Số lượng file ảnh bổ sung:", imageFiles.length);
      console.log("📝 Form values từ modal:", values);
      console.log("🔄 Backend Status:", backendStatus);
      console.log(
        "🔧 UPDATE PROGRESS - Có gửi ảnh không?",
        imageFiles.length > 0 ? "CÓ" : "KHÔNG"
      );
      console.log(
        "🏷️ UPDATE PROGRESS - updateData có chứa Image?",
        "Image" in updateData
      );

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
      updateForm.resetFields();
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
      image: [],
      imageAction: "add",
    });

    console.log("🔍 Form values set:", {
      medicineName: submission.medicationName || submission.medicineName,
      quantity: submission.quantity || submission.Quantity,
      dosage: submission.dosage,
      instructions: submission.instructions,
      urgency: submission.urgency || "normal",
      notes: submission.notes || "",
      image: [],
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

      // Chuyển fileList thành array file gốc
      console.log("🔍 DEBUG - values.image raw:", values.image);
      console.log("🔍 DEBUG - values.image type:", typeof values.image);
      console.log(
        "🔍 DEBUG - values.image isArray:",
        Array.isArray(values.image)
      );

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

      console.log("🔍 DEBUG - imageFiles after processing:", imageFiles);
      console.log("🔍 DEBUG - imageFiles length:", imageFiles.length);
      console.log("🔍 DEBUG - imageAction:", values.imageAction);

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

      // Logic xử lý ảnh dựa trên imageAction
      const imageAction = values.imageAction || "add";
      const hasImages = imageFiles.length > 0;

      if (hasImages && imageAction === "replace") {
        // THAY THẾ: Thêm Image vào updateData
        updateData.Image = imageFiles;
        console.log("🔄 Chế độ THAY THẾ: Thêm Image vào updateData");
      }

      console.log("🚀 Edit Submit - JSON Data gửi lên API UPDATE:", updateData);
      console.log("📁 Số lượng file ảnh mới:", imageFiles.length);
      console.log("📝 Form values:", values);
      console.log("🖼️ Image files:", imageFiles);
      console.log("🔧 Image Action:", imageAction);
      console.log("🔧 Has Images:", hasImages);
      console.log("🆔 StudentID for addImage API:", studentID);

      if (
        !selectedSubmission.id ||
        selectedSubmission.id.toString().startsWith("TEST_")
      ) {
        message.error("ID thuốc không hợp lệ! Không thể cập nhật test data.");
        return;
      }

      // Api Update
      await medicineApi.nurse.update(selectedSubmission.id, updateData);

      // API AddImanage
      if (hasImages && imageAction === "add") {
        await medicineApi.nurse.addImage(
          selectedSubmission.id,
          imageFiles,
          studentID
        );
        console.log("Thêm ảnh mới thành công!");
      }

      fetchSubmissions();

      // Success message dựa trên action
      let successMessage = "Cập nhật thông tin thuốc thành công!";
      if (hasImages) {
        if (imageAction === "replace") {
          successMessage += ` Đã thay thế bằng ${imageFiles.length} ảnh mới.`;
        } else {
          successMessage += ` Đã thêm ${imageFiles.length} ảnh mới.`;
        }
      }

      message.success(successMessage);
      setEditModalVisible(false);
      editForm.resetFields(); // 🆕 Reset form sau khi update thành công
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

  const classes = ["1A", "2A", "3A", "4A", "5A"];
  const statuses = ["pending", "approved", "in-use", "completed", "rejected"];

  // Handle search function
  const handleSearch = () => {
    // Search is handled in filteredSubmissions filter logic
    console.log("🔍 Searching for:", searchText);
  };

  // Updated filter logic to use searchText for multi-field search
  const filteredSubmissions = submissions.filter((submission) => {
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

    return matchesStatus && matchesClass && matchesSearch;
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
            Cho uống : {record.dosage}
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

  // Setup auto refresh - tự động refresh mỗi 30 giây
  useAutoRefresh(fetchSubmissions, 10000);

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
      {/* 🎨 Tab Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)",
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
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Quản Lý Thuốc Y Tế
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
                      Hệ thống tiếp nhận và quản lý thuốc cho học sinh tiểu học
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
        {/* 📊 Thống kê trạng thái đơn thuốc - ĐƯỢC DI CHUYỂN LÊN TRÊN ĐẦU */}
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
                <Text style={{ color: "white", fontSize: "24px" }}>💊</Text>
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
                  Thống kê trạng thái đơn thuốc
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    fontWeight: "400",
                  }}
                >
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
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
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
                    ⏳
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
                    {submissions.filter((s) => s.status === "pending").length}
                  </div>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: "#92400e",
                      fontWeight: "600",
                    }}
                  >
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
                  background:
                    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "20px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(34, 197, 94, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(34, 197, 94, 0.2)";
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
                    ✅
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#16a34a",
                      marginBottom: "6px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {submissions.filter((s) => s.status === "approved").length}
                  </div>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: "#15803d",
                      fontWeight: "600",
                    }}
                  >
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
                    💊
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
                    {submissions.filter((s) => s.status === "in-use").length}
                  </div>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: "#1d4ed8",
                      fontWeight: "600",
                    }}
                  >
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
                  background:
                    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  boxShadow: "0 10px 25px rgba(124, 58, 237, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "20px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(124, 58, 237, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(124, 58, 237, 0.2)";
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
                    🎯
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#7c3aed",
                      marginBottom: "6px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {submissions.filter((s) => s.status === "completed").length}
                  </div>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: "#6d28d9",
                      fontWeight: "600",
                    }}
                  >
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
                    ❌
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#dc2626",
                      marginBottom: "6px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {submissions.filter((s) => s.status === "rejected").length}
                  </div>
                  <Text
                    style={{
                      fontSize: "13px",
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
                          ? "⏳ Chờ xử lý"
                          : status === "approved"
                          ? "✅ Đã duyệt"
                          : status === "in-use"
                          ? "💊 Đang dùng"
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

        {/* 📋 Bảng danh sách thuốc */}
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
                  <Text style={{ color: "white", fontSize: "24px" }}>📋</Text>
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
                    Danh sách thuốc y tế
                  </Text>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      fontWeight: "400",
                    }}
                  >
                    Quản lý và theo dõi tình trạng sử dụng thuốc của học sinh
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
                  Thêm đơn thuốc mới
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
                `${range[0]}-${range[1]} của ${total} thuốc`,
            }}
            scroll={{ x: 800 }}
            style={{ borderRadius: "0 0 20px 20px" }}
          />
        </Card>

        {/* Modal xem chi tiết */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <EyeOutlined style={{ color: "#1890ff", fontSize: "20px" }} />
              <span>Chi tiết thuốc y tế</span>
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
                <Descriptions.Item label="Tên thuốc" span={2}>
                  <Text strong style={{ color: "#722ed1" }}>
                    {selectedSubmission.medicationName}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Liều dùng">
                  {selectedSubmission.dosage}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng">
                  {selectedSubmission.quantity}
                </Descriptions.Item>
                <Descriptions.Item label="Hướng dẫn" span={2}>
                  {selectedSubmission.instructions}
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

              {/* Hiển thị ảnh thuốc */}
              {selectedSubmission.medicationImages &&
                selectedSubmission.medicationImages.length > 0 && (
                  <div style={{ marginTop: "24px" }}>
                    <Text
                      strong
                      style={{
                        fontSize: "16px",
                        marginBottom: "12px",
                        display: "block",
                      }}
                    >
                      📸 Hình ảnh thuốc:
                    </Text>
                    <Row gutter={[12, 12]}>
                      {selectedSubmission.medicationImages.map(
                        (image, index) => (
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
                                alt={`Thuốc ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "120px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  cursor: "pointer", // 🆕 Thêm con trỏ click
                                }}
                                onClick={() => {
                                  // 🆕 Xử lý click để phóng to ảnh với navigation
                                  setImageList(
                                    selectedSubmission.medicationImages
                                  );
                                  setCurrentImageIndex(index);
                                  setPreviewImage(image);
                                  setPreviewTitle(
                                    `Ảnh thuốc ${index + 1}/${
                                      selectedSubmission.medicationImages.length
                                    } - ${selectedSubmission.medicationName}`
                                  );
                                  setImagePreviewVisible(true);
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
                        )
                      )}
                    </Row>
                  </div>
                )}

              {(!selectedSubmission.medicationImages ||
                selectedSubmission.medicationImages.length === 0) && (
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
                    📷 Chưa có hình ảnh thuốc
                  </Text>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Modal xử lý yêu cầu */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <CheckOutlined style={{ color: "#52c41a", fontSize: "20px" }} />
              <span>Xử lý yêu cầu thuốc</span>
            </div>
          }
          open={verifyModalVisible}
          onCancel={() => setVerifyModalVisible(false)}
          onOk={() => form.submit()}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleVerifySubmit}
            initialValues={{ status: "approved" }}
          >
            <Form.Item
              label="Trạng thái xử lý"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select>
                <Option value="approved">✅ Chấp nhận</Option>
                <Option value="rejected">❌ Từ chối</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Ghi chú" name="verificationNotes">
              <TextArea rows={4} placeholder="Nhập ghi chú..." />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal thêm thuốc mới */}
        <Modal
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
                <span style={{ fontSize: "20px" }}>💊</span>
              </div>
              <Text strong style={{ fontSize: "18px" }}>
                Thêm thuốc mới
              </Text>
            </div>
          }
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onOk={() => createForm.submit()}
          okText="Thêm thuốc"
          cancelText="Hủy"
          width={600}
        >
          <Form
            form={createForm}
            layout="vertical"
            onFinish={handleCreateMedicine}
          >
            <Form.Item
              label="Mã học sinh"
              name="studentId"
              rules={[
                { required: true, message: "Vui lòng nhập mã học sinh!" },
              ]}
            >
              <Input placeholder="Nhập mã học sinh..." />
            </Form.Item>
            <Form.Item
              label="Tên thuốc"
              name="medicineName"
              rules={[{ required: true, message: "Vui lòng nhập tên thuốc!" }]}
            >
              <Input placeholder="Nhập tên thuốc..." />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Số lượng"
                  name="quantity"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng!" },
                  ]}
                >
                  <Input placeholder="Nhập số lượng..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Liều dùng"
                  name="dosage"
                  rules={[
                    { required: true, message: "Vui lòng nhập liều dùng!" },
                  ]}
                >
                  <Input placeholder="Nhập liều dùng..." />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Hướng dẫn sử dụng"
              name="instructions"
              rules={[{ required: true, message: "Vui lòng nhập hướng dẫn!" }]}
            >
              <TextArea rows={3} placeholder="Nhập hướng dẫn sử dụng..." />
            </Form.Item>
            <Form.Item
              label="Hình ảnh thuốc"
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
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                    📷
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Chọn ảnh
                    <br />
                    (tối đa 5 ảnh)
                  </div>
                </div>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal cập nhật tiến độ */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <ClockCircleOutlined
                style={{ color: "#fa8c16", fontSize: "20px" }}
              />
              <span>Cập nhật tiến độ sử dụng</span>
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
                <Option value="in-use">💊 Đang sử dụng</Option>
                <Option value="completed">🎯 Hoàn thành</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Thời gian thực hiện" name="administrationTime">
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item label="Ghi chú tiến độ" name="progressNotes">
              <TextArea rows={3} placeholder="Nhập ghi chú về tiến độ..." />
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

        {/* Modal chỉnh sửa thuốc */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <EditOutlined style={{ color: "#722ed1", fontSize: "20px" }} />
              <span>Chỉnh sửa thông tin thuốc</span>
            </div>
          }
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            editForm.resetFields(); // 🆕 Reset form khi đóng modal
          }}
          onOk={() => editForm.submit()}
          okText="Lưu thay đổi"
          cancelText="Hủy"
          width={600}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <Form.Item
              label="Tên thuốc"
              name="medicineName"
              rules={[{ required: true, message: "Vui lòng nhập tên thuốc!" }]}
            >
              <Input placeholder="Nhập tên thuốc..." />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Số lượng"
                  name="quantity"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng!" },
                  ]}
                >
                  <Input placeholder="Nhập số lượng..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Liều dùng"
                  name="dosage"
                  rules={[
                    { required: true, message: "Vui lòng nhập liều dùng!" },
                  ]}
                >
                  <Input placeholder="Nhập liều dùng..." />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Hướng dẫn sử dụng"
              name="instructions"
              rules={[{ required: true, message: "Vui lòng nhập hướng dẫn!" }]}
            >
              <TextArea rows={3} placeholder="Nhập hướng dẫn sử dụng..." />
            </Form.Item>
            <Form.Item label="Ghi chú" name="notes">
              <TextArea rows={3} placeholder="Nhập ghi chú..." />
            </Form.Item>

            {/* 🆕 Hiển thị ảnh hiện tại */}
            {selectedSubmission?.medicationImages &&
              selectedSubmission.medicationImages.length > 0 && (
                <Form.Item label="Ảnh hiện tại">
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {selectedSubmission.medicationImages.map(
                      (imageUrl, index) => (
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
                              setImageList(selectedSubmission.medicationImages);
                              setCurrentImageIndex(index);
                              setPreviewImage(imageUrl);
                              setPreviewTitle(
                                `Ảnh hiện tại ${index + 1}/${
                                  selectedSubmission.medicationImages.length
                                }`
                              );
                              setImagePreviewVisible(true);
                            }}
                          />
                        </div>
                      )
                    )}
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
              label="Ảnh thuốc"
              name="image"
              help="Chọn ảnh để thêm vào hoặc thay thế (tùy theo lựa chọn bên trên)"
            >
              <Upload
                listType="picture-card"
                beforeUpload={() => false}
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
                  <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                </div>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal phóng to ảnh với navigation và zoom */}
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
                      "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>💊</span>
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
                        `Ảnh thuốc ${newIndex + 1}/${imageList.length}`
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
                        `Ảnh thuốc ${newIndex + 1}/${imageList.length}`
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
                  '<div style="font-size: 48px; margin-bottom: 16px;">💊</div>' +
                  '<div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">Không thể tải ảnh</div>' +
                  '<div style="font-size: 12px; color: #666;">URL: ' +
                  previewImage +
                  "</div>" +
                  "</div>";
              }}
              onClick={(e) => {
                // 🆕 Zoom effect on click - cải thiện zoom
                if (e.target.style.transform === "scale(1.3)") {
                  e.target.style.transform = "scale(1)";
                  e.target.style.cursor = "zoom-in";
                } else {
                  e.target.style.transform = "scale(1.3)"; // Giảm zoom từ 1.5 -> 1.3 để không bị cắt
                  e.target.style.cursor = "zoom-out";
                }
              }}
            />

            {/* 🆕 Navigation arrows on image */}
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
                      `Ảnh thuốc ${newIndex + 1}/${imageList.length}`
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
                      `Ảnh thuốc ${newIndex + 1}/${imageList.length}`
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
export default MedicationSubmission;
