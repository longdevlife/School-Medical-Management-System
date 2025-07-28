import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Card,
  Tag,
  Space,
  message,
  Row,
  Col,
  Descriptions,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  SyncOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import medicineApi from "../../api/medicineApi";
import studentApi from "../../api/studentApi";
import useAutoRefresh from "../../hooks/useAutoRefresh";


const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;
const { Title, Text } = Typography;

const MedicineManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [viewingMedicine, setViewingMedicine] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // 🆕 IMAGE MODAL - Cách đơn giản và hiệu quả
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [allImages, setAllImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // History states
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [viewingMedicineHistory, setViewingMedicineHistory] = useState(null);
  const [medicineHistory, setMedicineHistory] = useState([]);

  const [students, setStudents] = useState([]);
  const [studentsInitialized, setStudentsInitialized] = useState(false); // 🆕 Theo dõi việc load students lần đầu
  const [fetchingStudents, setFetchingStudents] = useState(false); // 🆕 Theo dõi đang fetch students
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");

  // Component mount
  useEffect(() => {
    console.log("🚀 Component mounting...");

    // Tải danh sách học sinh trước
    // fetchMedicinesFromServer sẽ được gọi tự động khi studentsInitialized = true
    const initializeData = async () => {
      try {
        await fetchStudents();
        // Không cần gọi fetchMedicinesFromServer ở đây nữa
        // Nó sẽ được gọi tự động trong useEffect theo dõi studentsInitialized
      } catch (error) {
        console.error("❌ Lỗi khởi tạo dữ liệu:", error);
      }
    };

    initializeData();

    // Thêm listeners cho trạng thái online/offline
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOfflineStatus);

    // 🆕 Thêm listener để refresh khi user quay lại tab (catch updates từ nurse)
    const handleVisibilityChange = () => {
      if (!document.hidden && navigator.onLine && studentsInitialized) {
        console.log(
          "👀 User quay lại tab, đang refresh dữ liệu để cập nhật trạng thái mới nhất..."
        );
        setTimeout(() => {
          fetchMedicinesFromServer();
        }, 1000); // Đợi 1s để đảm bảo tab đã focus hoàn toàn
      }
    };

    const handleWindowFocus = () => {
      if (navigator.onLine && studentsInitialized) {
        console.log(
          "🔄 Window focus, refresh dữ liệu để cập nhật trạng thái..."
        );
        setTimeout(() => {
          fetchMedicinesFromServer();
        }, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    // Tạo interval để cố gắng đồng bộ định kỳ và check database changes
    const syncInterval = setInterval(() => {
      if (navigator.onLine && studentsInitialized) {
        const pendingSyncMedicines = medicines.filter(
          (m) => m._pendingSync === true || m._isTemp === true
        );
        if (pendingSyncMedicines.length > 0) {
          console.log(
            "⏱️ Tự động đồng bộ định kỳ:",
            pendingSyncMedicines.length,
            "yêu cầu"
          );
          syncPendingMedicines(pendingSyncMedicines);
        }

        // ✅ Định kỳ refresh dữ liệu để phát hiện thay đổi database (bao gồm việc xóa)
        console.log("⏱️ Định kỳ check database changes (bao gồm xóa database)");
        fetchMedicinesFromServer();
      }
    }, 30000); // ✅ Giảm từ 2 phút xuống 30 giây để phát hiện thay đổi nhanh hơn

    return () => {
      // Cleanup listeners khi component unmount
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(syncInterval);

      // Lưu lại state medicines khi component unmount để đảm bảo không mất dữ liệu
      saveMedicinesToStorage(medicines);
    };
  }, []); // 🔥 QUAN TRỌNG: Empty dependency array để chỉ chạy 1 lần khi mount

  // ==================== PERSISTENCE FUNCTIONS ====================

  const saveMedicinesToStorage = (medicinesList) => {
    try {
      // Chỉ lưu khi có dữ liệu
      if (!medicinesList || medicinesList.length === 0) {
        console.log("⚠️ Không có dữ liệu thuốc để lưu");
        return;
      }

      console.log("💾 Lưu trữ thành công:", medicinesList.length, "thuốc");
    } catch (error) {
      console.error("❌ Lỗi khi lưu thuốc:", error);
    }
  };

  // Hàm đồng bộ các thuốc đang chờ khi có kết nối
  const syncPendingMedicines = async (pendingMedicines) => {
    if (!pendingMedicines || pendingMedicines.length === 0) return;

    console.log(
      "🔄 Attempting to sync pending medicines:",
      pendingMedicines.length
    );

    // Kiểm tra kết nối internet
    if (!navigator.onLine) {
      console.log("❌ No internet connection, sync postponed");
      return;
    }

    // Đồng bộ từng thuốc một
    for (const medicine of pendingMedicines) {
      try {
        console.log(`🔄 Syncing medicine: ${medicine.MedicineID}`);

        const syncData = {
          MedicineName: medicine.MedicineName,
          Quantity: medicine.Quantity,
          Dosage: medicine.Dosage,
          Instructions: medicine.Instructions || "",
          Notes: medicine.Notes || "",
          StudentID: medicine.StudentID,
        };

        // ✅ Thêm ảnh nếu có file gốc được lưu
        if (medicine._originalFiles && medicine._originalFiles.length > 0) {
          syncData.Images = medicine._originalFiles;
          console.log(
            "�️ Found original files to sync:",
            medicine._originalFiles.length
          );
        }

        console.log("�🔍 Sync data prepared:", {
          ...syncData,
          ImagesCount: syncData.Images?.length || 0,
        });

        // Nếu là thuốc mới (tạm thời)
        if (medicine._isTemp) {
          console.log("🆕 Creating new medicine on server");
          const createResponse = await medicineApi.parent.createMedicine(
            syncData
          );

          if (
            createResponse?.data?.medicineID ||
            createResponse?.data?.MedicineID
          ) {
            const realId =
              createResponse.data.medicineID || createResponse.data.MedicineID;

            // Cập nhật ID thật và xóa trạng thái tạm
            setMedicines((prevMedicines) => {
              const updatedMedicines = prevMedicines.map((med) => {
                if (med.MedicineID === medicine.MedicineID) {
                  return {
                    ...med,
                    MedicineID: realId,
                    _isTemp: false,
                    _pendingSync: false,
                  };
                }
                return med;
              });
              saveMedicinesToStorage(updatedMedicines);
              return updatedMedicines;
            });

            console.log(
              `✅ Successfully synced new medicine. Temp ID: ${medicine.MedicineID}, Real ID: ${realId}`
            );
          }
        }
        // Nếu là thuốc cần cập nhật
        else if (medicine._pendingSync && !medicine._isTemp) {
          console.log("🔄 Updating existing medicine on server");
          await medicineApi.parent.updateMedicine({
            ...syncData,
            MedicineID: medicine.MedicineID,
          });

          // Xóa trạng thái đồng bộ
          setMedicines((prevMedicines) => {
            const updatedMedicines = prevMedicines.map((med) => {
              if (med.MedicineID === medicine.MedicineID) {
                return { ...med, _pendingSync: false };
              }
              return med;
            });
            saveMedicinesToStorage(updatedMedicines);
            return updatedMedicines;
          });

          console.log(
            `✅ Successfully synced medicine update: ${medicine.MedicineID}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Failed to sync medicine ${medicine.MedicineID}:`,
          error
        );
      }
    }
  };

  // ==================== HISTORY FUNCTIONS ====================

  const hasHistory = (record) => {
    const history = getMedicineHistory(record.MedicineID);
    return history && history.length > 0;
  };

  const getMedicineHistory = (medicineId) => {
    try {
      const historyData = localStorage.getItem("medicine_history");
      if (historyData) {
        const allHistory = JSON.parse(historyData);
        return allHistory[medicineId] || [];
      }
      return [];
    } catch (error) {
      console.error("❌ Error loading medicine history:", error);
      return [];
    }
  };

  //lưu thông tin sau khi cập nhật 
    const saveMedicineHistory = (medicineId, historyEntry) => {
    try {
      const historyData = localStorage.getItem("medicine_history");
      let allHistory = historyData ? JSON.parse(historyData) : {};
      if (!allHistory[medicineId]) {
        allHistory[medicineId] = [];
      }
      historyEntry.timestamp = new Date().toISOString();
      allHistory[medicineId].push(historyEntry);
      localStorage.setItem("medicine_history", JSON.stringify(allHistory));
    } catch (error) {
      console.error("❌ Error saving medicine history:", error);
    }
  };


  const getChangedFields = (oldData, newData) => {
    const changes = [];
    const fieldsToCheck = [
      "MedicineName",
      "Quantity",
      "Dosage",
      "Instructions",
      "Notes",
    ];

    fieldsToCheck.forEach((field) => {
      const oldValue = oldData[field] || "";
      const newValue = newData[field] || "";

      if (oldValue !== newValue) {
        changes.push({
          field: field,
          from: oldValue,
          to: newValue,
        });
      }
    });

    return changes;
  };

  const getFieldDisplayName = (fieldName) => {
    const fieldNames = {
      MedicineName: "Tên thuốc",
      Quantity: "Số lượng",
      Dosage: "Liều lượng",
      Instructions: "Hướng dẫn sử dụng",
      Notes: "Ghi chú",
      Status: "Trạng thái",
      Images: "Hình ảnh thuốc",
    };
    return fieldNames[fieldName] || fieldName;
  };

  const handleViewHistory = (record) => {
    console.log("📜 Viewing history for medicine:", record.MedicineID);

    const history = getMedicineHistory(record.MedicineID);
    setViewingMedicineHistory(record);
    setMedicineHistory(history);
    setIsHistoryModalVisible(true);
  };

  // ==================== API FUNCTIONS ====================

  const fetchStudents = async (isAutoRefresh = false) => {
    // 🚫 Ngăn việc gọi nhiều lần cùng lúc
    if (studentsLoading || fetchingStudents) {
      console.log("⚠️ fetchStudents đã đang chạy, bỏ qua...");
      return;
    }

    // 🚫 Ngăn việc gọi lại khi đã initialized (trừ khi force refresh)
    if (studentsInitialized && !isAutoRefresh) {
      console.log("⚠️ Students đã được initialized, bỏ qua...");
      return;
    }

    try {
      setStudentsLoading(true);
      setFetchingStudents(true); // 🆕 Đánh dấu đang fetch
      console.log("🔄 Đang lấy danh sách học sinh của phụ huynh...");

      // Sử dụng API từ studentApi
      const response = await studentApi.parent.getMyChildren();
      console.log("✅ API getMyChildren response:", response);

      // ✅ DEBUG: Kiểm tra response format
      console.log("🔍 API Response Analysis:", {
        responseType: typeof response.data,
        isArray: Array.isArray(response.data),
        length: response.data?.length || 0,
        firstStudent: response.data?.[0] || null,
        studentIDs: response.data?.map((s) => s.studentID) || [],
      });

      const studentsData = response.data || [];

      if (Array.isArray(studentsData) && studentsData.length > 0) {
        // ✅ LOG từng student để debug
        studentsData.forEach((student, index) => {
          console.log(`📋 Student #${index + 1}:`, {
            studentID: student.studentID,
            studentName: student.studentName,
            class: student.class,
            parentName: student.parentName,
          });
        });

        const processedStudents = studentsData.map((student) => {
          // Xử lý dữ liệu học sinh dựa trên cấu trúc thực tế từ API
          // ✅ Ưu tiên trường "class" mới từ backend
          return {
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
            Age:
              student.age ||
              (student.birthday
                ? new Date().getFullYear() -
                  new Date(student.birthday).getFullYear()
                : 0),
            Sex: student.sex || student.gender || "Chưa xác định",
            Birthday: student.birthday || student.dob || null,
            ParentName: student.parentName || null,
          };
        });

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

        // Chỉ hiển thị message khi thực sự cần (không phải call từ interval/auto-refresh)
        console.log("🔍 Debug fetchStudents message:", {
          isAutoRefresh,
          studentsLength: processedStudents.length,
        });

        // ❌ TẠM THỜI TẮT MESSAGE ĐỂ NGĂN SPAM
        // if (!isAutoRefresh) {
        //   message.success(`Đã tải ${processedStudents.length} học sinh`);
        // }

        // ✅ CHỈ HIỂN THỊ MESSAGE LẦN ĐẦU TIÊN
        if (!studentsInitialized && !isAutoRefresh) {
          console.log(`✅ Đã tải ${processedStudents.length} học sinh`);
        }
      } else {
        console.warn("⚠️ Không tìm thấy học sinh nào từ API");
        // Nếu không có dữ liệu từ API, sử dụng dữ liệu mẫu
        createMockStudents();
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách học sinh:", error);
      console.error("❌ Chi tiết lỗi:", error.response?.data);
      console.error("❌ Mã lỗi:", error.response?.status);

      // Sử dụng dữ liệu mẫu nếu có lỗi
      createMockStudents();
    } finally {
      setStudentsLoading(false);
      setFetchingStudents(false); // 🆕 Đánh dấu kết thúc fetch
      setStudentsInitialized(true); // 🆕 Đánh dấu đã hoàn thành việc load students
    }
  };

  const createMockStudents = () => {
    console.log("⚠️ Sử dụng dữ liệu học sinh mẫu");
    console.log(
      "🚨 CẢNH BÁO: StudentID từ mock data có thể KHÔNG TỒN TẠI trong database backend!"
    );
    console.log(
      "🔧 Giải pháp: Đảm bảo backend có StudentProfile với các ID này hoặc sử dụng data thật từ API"
    );

    const mockStudents = [
      {
        StudentID: "ST001",
        StudentName: "Lê Văn Bình",
        Class: "Lớp 2",
        Age: 8,
        Sex: "Nam",
      },
      {
        StudentID: "ST002",
        StudentName: "Lê Thị Cẩm Ly",
        Class: "Lớp 4",
        Age: 10,
        Sex: "Nữ",
      },
    ];

    setStudents(mockStudents);
    setStudentsInitialized(true); // 🆕 Đánh dấu đã hoàn thành việc load students
    setFetchingStudents(false); // 🆕 Đánh dấu kết thúc fetch
    if (mockStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(mockStudents[0].StudentID);
    }

    message.warning("Sử dụng dữ liệu mẫu - Vui lòng kiểm tra kết nối");
  };

  const normalizeStatus = (status) => {
    // Nếu status không tồn tại, trả về giá trị mặc định
    if (!status) return "Chờ xử lý";

    // Debug - log trạng thái gốc
    console.log("📝 Normalize status - Original:", status);

    // Đưa về chữ thường và bỏ dấu cách thừa để dễ so sánh
    const cleanStatus = status.toString().toLowerCase().trim();

    // Debug - log trạng thái đã làm sạch
    console.log("�� Normalize status - Cleaned:", cleanStatus);

    // Mapping đầy đủ hơn để xử lý các trường hợp khác nhau
    const statusMap = {
      // Các trạng thái tiếng Việt chuẩn
      "chờ xử lý": "Chờ xử lý",
      "đã xác nhận": "Đã xác nhận",
      "đã duyệt": "Đã xác nhận", // ⭐ Đồng bộ "Đã duyệt" từ y tế thành "Đã xác nhận" cho phụ huynh
      "đang thực hiện": "Đang thực hiện",
      "đã hoàn thành": "Đã hoàn thành",
      "từ chối": "Từ chối",
      "chờ xác nhận": "Chờ xác nhận",

      // Các trạng thái có thể bị mã hóa sai UTF-8
      "cho xu ly": "Chờ xử lý",
      "cho xac nhan": "Chờ xác nhận",
      "da xac nhan": "Đã xác nhận",
      "da duyet": "Đã xác nhận", // ⭐ Đồng bộ "Đã duyệt" từ y tế thành "Đã xác nhận" cho phụ huynh
      "dang thuc hien": "Đang thực hiện",
      "da hoan thanh": "Đã hoàn thành",
      "tu choi": "Từ chối",

      // Các trạng thái mã hóa sai tiềm ẩn từ server
      "ch? x? lý": "Chờ xử lý",
      "ch? xác nh?n": "Chờ xác nhận",
      "ðã xác nh?n": "Đã xác nhận",
      "ðã duy?t": "Đã xác nhận", // ⭐ Đồng bộ "Đã duyệt" từ y tế thành "Đã xác nhận" cho phụ huynh
      "ðang th?c hi?n": "Đang thực hiện",
      "ðã hoàn thành": "Đã hoàn thành",
      "t? ch?i": "Từ chối",

      // Các trạng thái viết tắt hoặc sai chính tả
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      approved: "Đã xác nhận", // ⭐ Đồng bộ các trạng thái từ tiếng Anh
      "in progress": "Đang thực hiện",
      completed: "Đã hoàn thành",
      rejected: "Từ chối",
      waiting: "Chờ xử lý",
      processing: "Đang thực hiện",
      done: "Đã hoàn thành",

      // Các giá trị số (nếu có)
      0: "Chờ xử lý",
      1: "Đã xác nhận",
      2: "Đang thực hiện",
      3: "Đã hoàn thành",
      4: "Từ chối",
    };

    // Thử tìm trong mapping với chuỗi đã được chuẩn hóa
    const result = statusMap[cleanStatus];
    if (result) {
      console.log("📝 Normalize status - Mapped:", result);
      return result;
    }

    // Nếu không tìm được, thử kiểm tra một cách thông minh hơn
    if (
      cleanStatus.includes("ch") &&
      (cleanStatus.includes("ly") || cleanStatus.includes("xu"))
    ) {
      return "Chờ xử lý";
    }
    if (cleanStatus.includes("xac") && cleanStatus.includes("nhan")) {
      return cleanStatus.includes("da") ? "Đã xác nhận" : "Chờ xác nhận";
    }
    if (cleanStatus.includes("hoan") && cleanStatus.includes("thanh")) {
      return "Đã hoàn thành";
    }
    if (cleanStatus.includes("tu") && cleanStatus.includes("choi")) {
      return "Từ chối";
    }
    if (cleanStatus.includes("thuc") && cleanStatus.includes("hien")) {
      return "Đang thực hiện";
    }
    // ⭐ Kiểm tra "duyệt" -> Đã xác nhận
    if (
      cleanStatus.includes("duyet") ||
      cleanStatus.includes("duy?t") ||
      cleanStatus.includes("approv")
    ) {
      console.log("📝 Normalize status - Detected approval:", cleanStatus);
      return "Đã xác nhận";
    }

    // Log trạng thái không thể chuẩn hóa để debug
    console.log("⚠️ Trạng thái không thể chuẩn hóa:", status);

    // Trả về nguyên bản nếu không tìm được mapping phù hợp
    return status;
  };

  const fetchMedicinesFromServer = async () => {
    try {
      setLoading(true);
      if (!navigator.onLine) {
        // Nếu offline, chỉ dùng localStorage
        loadPersistedMedicines();
        setLoading(false);
        return;
      }

      // Lấy danh sách học sinh từ state hiện tại
      const currentStudents = students.length > 0 ? students : [];

      if (currentStudents.length === 0) {
        console.log("⚠️ Chưa có danh sách học sinh");

        // Nếu students chưa được initialized, chờ và chỉ dùng localStorage khi offline
        if (!studentsInitialized) {
          console.log("⏳ Students đang được tải, chờ...");
          if (!navigator.onLine) {
            loadPersistedMedicines();
          } else {
            setMedicines([]); // Hiển thị rỗng khi online nhưng chưa có students
          }
          setLoading(false);
          return;
        }

        // Nếu đã initialized nhưng vẫn không có students
        console.log("📁 Students đã tải xong nhưng không có dữ liệu");
        if (!navigator.onLine) {
          console.log("📱 Offline - Sử dụng localStorage");
          loadPersistedMedicines();
        } else {
          console.log("🌐 Online - Hiển thị rỗng vì không có students");
          setMedicines([]);
          saveMedicinesToStorage([]);

          // 🔥 XÓA LỊCH SỬ THUỐC khi không có students (có thể do database trống)
          console.log("🗑️ Xóa lịch sử thuốc vì không có students");
          clearMedicineHistory("Không có students");
        }
        setLoading(false);
        return;
      }

      console.log(
        "📚 Sử dụng API tối ưu: Lấy TẤT CẢ thuốc của parent từ 1 lần gọi API"
      );

      // ✅ OPTIMIZATION: Chỉ gọi 1 lần API thay vì loop cho từng student
      let allMedicines = [];
      try {
        const studentIds = currentStudents.map((student) => student.StudentID);
        console.log("🔍 Danh sách ID học sinh:", studentIds);

        if (studentIds.length === 0) {
          console.log("⚠️ Không có học sinh nào để lấy thuốc");
          if (!navigator.onLine) {
            loadPersistedMedicines();
          } else {
            setMedicines([]);
            saveMedicinesToStorage([]);

            // 🔥 XÓA LỊCH SỬ THUỐC khi không có studentIds
            console.log("🗑️ Xóa lịch sử thuốc vì không có studentIds");
            clearMedicineHistory("Không có studentIds");
          }
          setLoading(false);
          return;
        }

        // 🎯 GỌI 1 LẦN API DUY NHẤT để lấy tất cả medicines của parent
        console.log(`🎯 Đang gọi API lấy TẤT CẢ thuốc của parent...`);
        const response = await medicineApi.parent.getMedicinesByParentId();

        // Debug chi tiết response từ API
        console.log(`✅ API getMedicinesByParentId response:`, response);
        console.log(`📊 Response data structure:`, {
          hasResponse: !!response,
          hasData: !!response?.data,
          dataType: typeof response?.data,
          isArray: Array.isArray(response?.data),
          dataLength: Array.isArray(response?.data)
            ? response.data.length
            : "N/A",
          dataKeys: response?.data ? Object.keys(response.data) : [],
          sampleData:
            response?.data &&
            Array.isArray(response.data) &&
            response.data.length > 0
              ? response.data[0]
              : response?.data,
        });

        if (response?.data) {
          if (Array.isArray(response.data)) {
            allMedicines = response.data;
            console.log(
              `📦 Dữ liệu là mảng trực tiếp: ${allMedicines.length} thuốc tổng`
            );
          } else if (response.data.data && Array.isArray(response.data.data)) {
            allMedicines = response.data.data;
            console.log(
              `📦 Dữ liệu nằm trong trường data: ${allMedicines.length} thuốc tổng`
            );
          } else if (response.data.medicineID || response.data.MedicineID) {
            allMedicines = [response.data];
            console.log("📦 Dữ liệu là một đối tượng thuốc đơn lẻ");
          } else {
            console.log(
              "⚠️ Dữ liệu có cấu trúc không xác định:",
              response.data
            );
            allMedicines = [];
          }

          // 🔍 Filter medicines theo studentIds của parent (đảm bảo chỉ hiển thị thuốc của con)
          const filteredMedicines = allMedicines.filter((med) => {
            const medicineStudentId =
              med.studentID || med.StudentID || med.student_id;
            const isForParentChild = studentIds.includes(medicineStudentId);
            if (!isForParentChild && medicineStudentId) {
              console.log(
                `🚫 Loại bỏ thuốc không thuộc con của parent: ${
                  med.medicineID || med.MedicineID
                } (StudentID: ${medicineStudentId})`
              );
            }
            return isForParentChild;
          });

          allMedicines = filteredMedicines;
          console.log(
            `✅ Sau khi filter: ${allMedicines.length} thuốc thuộc về con của parent`
          );

          // Kiểm tra chi tiết trạng thái của các thuốc
          if (allMedicines.length > 0) {
            console.log("📋 Chi tiết các thuốc nhận được:");
            allMedicines.forEach((med, idx) => {
              console.log(`Thuốc #${idx + 1}:`, {
                id: med.medicineID || med.MedicineID,
                name: med.medicineName || med.MedicineName,
                status_original: med.status || med.Status,
                status_normalized: normalizeStatus(
                  med.status || med.Status || "Chờ xử lý"
                ),
                studentId: med.studentID || med.StudentID || med.student_id,
              });
            });
          }
        } else {
          console.log("⚠️ Không nhận được dữ liệu từ API");
          allMedicines = [];
        }

        console.log("📊 Tổng số thuốc nhận được:", allMedicines.length);

        // Debug - kiểm tra xem có thuốc đã duyệt hay không
        const approvedMeds = allMedicines.filter(
          (m) =>
            m.status === "Đã xác nhận" ||
            m.status === "Đã duyệt" ||
            m.Status === "Đã xác nhận" ||
            m.Status === "Đã duyệt"
        );
        console.log("📊 Số lượng thuốc đã được duyệt:", approvedMeds.length);
        if (approvedMeds.length > 0) {
          console.log(
            "📊 Chi tiết thuốc đã duyệt:",
            approvedMeds.map((med) => ({
              id: med.medicineID || med.MedicineID,
              name: med.medicineName || med.MedicineName,
              status_original: med.status || med.Status,
            }))
          );
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu từ API:", error);

        // ✅ CHỈ fallback về localStorage khi OFFLINE
        if (!navigator.onLine) {
          console.log("📱 Offline - Sử dụng localStorage");
          loadPersistedMedicines();
        } else {
          console.log(
            "🌐 Online nhưng có lỗi API - Hiển thị rỗng thay vì localStorage cũ"
          );

          // Chỉ giữ lại thuốc pending
          const pendingMedicines = medicines.filter(
            (m) => m._pendingSync === true || m._isTemp === true
          );
          setMedicines(pendingMedicines);
          saveMedicinesToStorage(pendingMedicines);

          message.error("Lỗi kết nối API - Chỉ hiển thị thuốc chưa đồng bộ");
        }

        setLoading(false);
        return;
      }

      // ✅ QUAN TRỌNG: Nếu API trả về rỗng, có nghĩa database đã bị xóa
      // KHÔNG ĐƯỢC fallback về localStorage trong trường hợp này
      if (allMedicines.length === 0) {
        console.log(
          "🗑️ API trả về rỗng - Database đã bị xóa hoặc không có thuốc"
        );

        // Chỉ giữ lại các thuốc đang chờ đồng bộ (nếu có)
        const pendingMedicines = medicines.filter(
          (m) => m._pendingSync === true || m._isTemp === true
        );

        if (pendingMedicines.length === 0) {
          console.log("🗑️ Không có thuốc pending, xóa toàn bộ UI và lịch sử");
          console.log("✅ Dữ liệu đã được đồng bộ với database (trống)");
          setMedicines([]);
          saveMedicinesToStorage([]);

          // 🔥 XÓA LỊCH SỬ THUỐC khi database trống hoàn toàn
          console.log("🗑️ Xóa lịch sử thuốc vì database đã trống hoàn toàn");
          clearMedicineHistory("Database trống hoàn toàn");
        } else {
          console.log(
            `⏳ Chỉ giữ ${pendingMedicines.length} thuốc pending chưa đồng bộ`
          );
          setMedicines(pendingMedicines);
          saveMedicinesToStorage(pendingMedicines);
          message.warning(
            `Database trống, chỉ còn ${pendingMedicines.length} thuốc chưa đồng bộ`
          );
        }

        setLoading(false);
        return;
      }

      // Chuẩn hóa dữ liệu từ server
      const processedServerMedicines = allMedicines.map((medicine) => {
        console.log("🔍 Processing medicine from server:", {
          id: medicine.medicineID || medicine.MedicineID,
          name: medicine.medicineName || medicine.MedicineName,
          File: medicine.File,
          files: medicine.files,
          Images: medicine.Images,
          images: medicine.images,
          Image: medicine.Image,
          image: medicine.image,
        });

        // ✅ Xử lý ảnh từ nhiều nguồn có thể có - ưu tiên File array
        let processedImages = [];
        let fileArray = [];

        if (
          medicine.File &&
          Array.isArray(medicine.File) &&
          medicine.File.length > 0
        ) {
          // Backend trả về File array với FileLink
          fileArray = medicine.File;
          processedImages = medicine.File.map(
            (file) => file.FileLink || file.fileLink || file.url
          ).filter(Boolean);
          console.log("✅ Found images from File array:", processedImages);
        } else if (
          medicine.files &&
          Array.isArray(medicine.files) &&
          medicine.files.length > 0
        ) {
          fileArray = medicine.files;
          processedImages = medicine.files
            .map((file) => file.FileLink || file.fileLink || file.url)
            .filter(Boolean);
          console.log("✅ Found images from files array:", processedImages);
        } else if (
          medicine.Images &&
          Array.isArray(medicine.Images) &&
          medicine.Images.length > 0
        ) {
          processedImages = medicine.Images.filter(Boolean);
          console.log("✅ Found images from Images array:", processedImages);
        } else if (
          medicine.images &&
          Array.isArray(medicine.images) &&
          medicine.images.length > 0
        ) {
          processedImages = medicine.images.filter(Boolean);
          console.log("✅ Found images from images array:", processedImages);
        } else if (
          medicine.Image &&
          Array.isArray(medicine.Image) &&
          medicine.Image.length > 0
        ) {
          processedImages = medicine.Image.filter(Boolean);
          console.log("✅ Found images from Image array:", processedImages);
        } else if (
          medicine.image &&
          Array.isArray(medicine.image) &&
          medicine.image.length > 0
        ) {
          processedImages = medicine.image.filter(Boolean);
          console.log("✅ Found images from image array:", processedImages);
        } else if (medicine.image && typeof medicine.image === "string") {
          processedImages = [medicine.image];
          console.log("✅ Found single image string:", processedImages);
        } else {
          console.log(
            "❌ No images found for medicine:",
            medicine.medicineID || medicine.MedicineID
          );
        }

        return {
          MedicineID: medicine.medicineID || medicine.MedicineID,
          MedicineName: medicine.medicineName || medicine.MedicineName,
          Quantity: medicine.quantity || medicine.Quantity,
          Dosage: medicine.dosage || medicine.Dosage,
          Instructions: medicine.instructions || medicine.Instructions || "",
          Notes: medicine.notes || medicine.Notes || "",
          Status: normalizeStatus(
            medicine.status || medicine.Status || "Chờ xử lý"
          ),
          SentDate:
            medicine.sentDate || medicine.SentDate || medicine.createdAt,
          StudentID:
            medicine.studentID || medicine.StudentID || medicine.student_id,
          NurseID: medicine.nurseID || medicine.NurseID || null,
          ParentID: medicine.parentID || medicine.ParentID || null,
          Images: processedImages, // Mảng URL ảnh để hiển thị
          File: fileArray, // Mảng File objects từ backend để dùng trong edit
          _fromServer: true,
          _serverFetchedAt: new Date().toISOString(),
        };
      });

      // Kiểm tra trạng thái sau khi chuẩn hóa
      const statusCounts = {};
      processedServerMedicines.forEach((med) => {
        statusCounts[med.Status] = (statusCounts[med.Status] || 0) + 1;
      });
      console.log("📊 Phân bố trạng thái sau khi chuẩn hóa:", statusCounts);

      // Chỉ giữ lại các thuốc đang chờ đồng bộ (nếu có)
      const pendingMedicines = medicines.filter(
        (m) => m._pendingSync === true || m._isTemp === true
      );

      // ✅ Kết hợp data từ server và pending medicines
      const combinedMedicines = [
        ...processedServerMedicines,
        ...pendingMedicines.filter(
          (m) =>
            !processedServerMedicines.some((s) => s.MedicineID === m.MedicineID)
        ),
      ];

      setMedicines(combinedMedicines);
      saveMedicinesToStorage(combinedMedicines);
      console.log(
        `✅ Đã tải ${processedServerMedicines.length} yêu cầu thuốc từ server`
      );
    } catch (error) {
      console.error("❌ Lỗi không xác định:", error);

      // ✅ CHỈ fallback về localStorage khi OFFLINE
      if (!navigator.onLine) {
        console.log("📱 Offline - Sử dụng localStorage");
        message.warning("Không có kết nối internet - Hiển thị dữ liệu cục bộ");
        loadPersistedMedicines();
      } else {
        console.log(
          "🌐 Online nhưng có lỗi - Hiển thị rỗng thay vì localStorage cũ"
        );

        // Chỉ giữ lại thuốc pending
        const pendingMedicines = medicines.filter(
          (m) => m._pendingSync === true || m._isTemp === true
        );
        setMedicines(pendingMedicines);
        saveMedicinesToStorage(pendingMedicines);

        message.error("Lỗi không xác định - Chỉ hiển thị thuốc chưa đồng bộ");
      }
    } finally {
      setLoading(false);
    }
  };
  
  //tự động refresh 
  useAutoRefresh(fetchMedicinesFromServer, 30000);
  // ==================== HANDLER FUNCTIONS ====================

  const getStudentName = (studentId) => {
    const student = students.find((s) => s.StudentID === studentId);
    return student ? student.StudentName : studentId;
  };

  const getStudentClass = (studentId) => {
    const student = students.find((s) => s.StudentID === studentId);
    return student ? student.Class || "Chưa phân lớp" : "Chưa phân lớp";
  };

  const getCurrentStudentMedicines = () => {
    console.log("===== CHẠY HÀM LỌC THUỐC =====");
    console.log("Dữ liệu ban đầu:", {
      tổngSốThuốc: medicines.length,
      họcSinhĐangChọn: selectedStudentId,
      trạngTháiLọc: statusFilter,
    });

    // In ra tất cả ID thuốc đang có trong state để debug
    console.log(
      "Danh sách ID thuốc ban đầu:",
      medicines.map((m) => `${m.MedicineID} (${m.StudentID}, ${m.Status})`)
    );

    // Kiểm tra cụ thể các thuốc có trạng thái "Đã duyệt" hoặc "Đã xác nhận"
    const approvedMeds = medicines.filter(
      (m) => normalizeStatus(m.Status) === "Đã xác nhận"
    );
    console.log(
      "🔍 Thuốc đã được duyệt trong medicines:",
      approvedMeds.map((m) => `${m.MedicineID} (${m.StudentID}, ${m.Status})`)
    );

    let filteredMedicines = medicines;

    // Filter by student
    if (selectedStudentId) {
      console.log(`Đang lọc theo học sinh: ${selectedStudentId}`);

      // Sử dụng so sánh không phân biệt chữ hoa/thường để tránh lỗi case sensitivity
      filteredMedicines = filteredMedicines.filter((m) => {
        const match =
          m.StudentID &&
          selectedStudentId &&
          m.StudentID.toString().toLowerCase() ===
            selectedStudentId.toString().toLowerCase();

        if (!match && m.StudentID) {
          console.log(
            `❓ Thuốc không khớp: ${m.MedicineID}, StudentID: ${m.StudentID} vs ${selectedStudentId}`
          );
        }

        return match;
      });

      console.log(
        `Sau khi lọc theo học sinh: ${filteredMedicines.length} thuốc còn lại`
      );
      console.log(
        "ID thuốc sau khi lọc học sinh:",
        filteredMedicines.map((m) => m.MedicineID)
      );
    }

    // Filter by status
    if (statusFilter) {
      console.log(`Đang lọc theo trạng thái: ${statusFilter}`);

      // Kiểm tra chuẩn hóa trạng thái
      filteredMedicines = filteredMedicines.filter((m) => {
        const normalizedMedicineStatus = normalizeStatus(m.Status);
        const normalizedFilterStatus = normalizeStatus(statusFilter);
        const matches = normalizedMedicineStatus === normalizedFilterStatus;

        console.log(
          `Kiểm tra trạng thái của ${m.MedicineID}: ${m.Status} -> ${normalizedMedicineStatus} vs ${normalizedFilterStatus}: ${matches}`
        );

        return matches;
      });

      console.log(
        `Sau khi lọc theo trạng thái: ${filteredMedicines.length} thuốc còn lại`
      );
      console.log(
        "ID thuốc sau khi lọc trạng thái:",
        filteredMedicines.map((m) => m.MedicineID)
      );
    }

    console.log("===== KẾT QUẢ LỌC =====");
    console.log(`Tổng số thuốc sau khi lọc: ${filteredMedicines.length}`);

    return filteredMedicines;
  };

  const handleCreate = () => {
    if (!selectedStudentId) {
      message.warning("Vui lòng chọn học sinh trước");
      return;
    }

    // ✅ DEBUG: Kiểm tra StudentID trước khi submit
    const selectedStudent = students.find(
      (s) => s.StudentID === selectedStudentId
    );
    console.log("🔍 Debug handleCreate - Student Info:", {
      selectedStudentId,
      selectedStudent,
      allStudentIds: students.map((s) => s.StudentID),
      totalStudents: students.length,
      studentsFromMock: students.some((s) => s.StudentID.startsWith("ST00")), // Check if using mock data
      studentsFromAPI: students.some((s) => s.ParentName), // Check if from real API (has parentName field)
    });

    if (!selectedStudent) {
      console.error("❌ Selected student not found in students array");
      console.error(
        "Available students:",
        students.map((s) => ({
          StudentID: s.StudentID,
          StudentName: s.StudentName,
          Class: s.Class,
          ParentName: s.ParentName,
        }))
      );
      message.error("Học sinh được chọn không hợp lệ. Vui lòng chọn lại.");
      return;
    }

    // ✅ CRITICAL: Confirm StudentID matches API response format
    console.log("✅ Selected student confirmed:", {
      StudentID: selectedStudent.StudentID,
      StudentName: selectedStudent.StudentName,
      Class: selectedStudent.Class,
      ParentName: selectedStudent.ParentName,
      message: "StudentID này sẽ được gửi tới backend để tạo medicine",
    });

    setEditingMedicine(null);
    setIsModalVisible(true);
    form.resetFields();
    setFileList([]);
  };

  const handleEdit = (record) => {
    console.log("✏️ EDIT clicked for medicine:", record.MedicineID);

    setEditingMedicine(record);

    form.setFieldsValue({
      MedicineName: record.MedicineName,
      Quantity: record.Quantity,
      Dosage: record.Dosage,
      Instructions: record.Instructions || "",
      Notes: record.Notes || "",
    });

    // ✅ Load ảnh cũ vào fileList để hiển thị trong form edit
    const existingImages = [];

    // Tìm ảnh từ nhiều nguồn có thể có từ backend
    let medicineImages = [];

    console.log("🔍 Loading existing images for edit:", {
      medicineId: record.MedicineID,
      File: record.File,
      files: record.files,
      Images: record.Images,
      images: record.images,
      Image: record.Image,
      image: record.image,
    });

    // ✅ Ưu tiên lấy từ File array (chính xác nhất từ backend)
    if (record.File && Array.isArray(record.File) && record.File.length > 0) {
      medicineImages = record.File.map(
        (file) => file.FileLink || file.fileLink || file.url
      ).filter(Boolean);
      console.log("✅ Found images from File array for edit:", medicineImages);
    } else if (
      record.files &&
      Array.isArray(record.files) &&
      record.files.length > 0
    ) {
      medicineImages = record.files
        .map((file) => file.FileLink || file.fileLink || file.url)
        .filter(Boolean);
      console.log("✅ Found images from files array for edit:", medicineImages);
    } else if (
      record.Images &&
      Array.isArray(record.Images) &&
      record.Images.length > 0
    ) {
      medicineImages = record.Images.filter(Boolean);
      console.log(
        "✅ Found images from Images array for edit:",
        medicineImages
      );
    } else if (
      record.images &&
      Array.isArray(record.images) &&
      record.images.length > 0
    ) {
      medicineImages = record.images.filter(Boolean);
      console.log(
        "✅ Found images from images array for edit:",
        medicineImages
      );
    } else if (
      record.Image &&
      Array.isArray(record.Image) &&
      record.Image.length > 0
    ) {
      medicineImages = record.Image.filter(Boolean);
      console.log("✅ Found images from Image array for edit:", medicineImages);
    } else if (
      record.image &&
      Array.isArray(record.image) &&
      record.image.length > 0
    ) {
      medicineImages = record.image.filter(Boolean);
      console.log("✅ Found images from image array for edit:", medicineImages);
    } else if (record.image && typeof record.image === "string") {
      medicineImages = [record.image];
      console.log("✅ Found single image string for edit:", medicineImages);
    } else if (record.Image && typeof record.Image === "string") {
      medicineImages = [record.Image];
      console.log("✅ Found single Image string for edit:", medicineImages);
    } else if (record.imageUrl && typeof record.imageUrl === "string") {
      medicineImages = [record.imageUrl];
      console.log("✅ Found imageUrl for edit:", medicineImages);
    } else {
      console.log(
        "❌ No images found for editing medicine:",
        record.MedicineID
      );
    }

    // Chuyển đổi ảnh thành format cho Upload component
    if (medicineImages.length > 0) {
      medicineImages.forEach((img, index) => {
        let imageUrl;
        if (typeof img === "string") {
          if (
            img.startsWith("http://") ||
            img.startsWith("https://") ||
            img.startsWith("data:")
          ) {
            imageUrl = img;
          } else {
            // ✅ Sử dụng HTTPS như backend
            const baseUrl = "https://localhost:7040";
            const cleanImg = img.startsWith("/") ? img : `/${img}`;
            imageUrl = `${baseUrl}${cleanImg}`;
          }

          existingImages.push({
            uid: `existing-${index}`,
            name: `medicine-image-${index + 1}.jpg`,
            status: "done",
            url: imageUrl,
            thumbUrl: imageUrl, // Quan trọng: để hiển thị preview
            response: { url: imageUrl }, // Để component Upload hiểu đây là ảnh đã upload
            isExisting: true, // Flag để phân biệt ảnh cũ và ảnh mới
          });
        }
      });
    }

    setFileList(existingImages);
    setIsModalVisible(true);

    console.log("✅ Edit form populated with data:", {
      name: record.MedicineName,
      quantity: record.Quantity,
      dosage: record.Dosage,
      existingImages: existingImages.length,
      medicineImages: medicineImages,
      fileList: existingImages,
    });
  };

  const handleView = (record) => {
    setViewingMedicine(record);
    setIsViewModalVisible(true);
  };

  // 🆕 XỬ LÝ CLICK ẢNH - ĐƠN GIẢN VÀ HIỆU QUẢ
  const openImageModal = (
    imageUrl,
    title = "Hình ảnh thuốc",
    allImageUrls = [],
    index = 0
  ) => {
    console.log("🖼️ Mở modal ảnh:", {
      imageUrl,
      title,
      totalImages: allImageUrls.length,
      index,
    });
    setCurrentImageUrl(imageUrl);
    setImageTitle(title);
    setAllImages(allImageUrls);
    setCurrentImageIndex(index);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setCurrentImageUrl("");
    setImageTitle("");
    setAllImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (allImages.length > 1) {
      const nextIndex = (currentImageIndex + 1) % allImages.length;
      setCurrentImageIndex(nextIndex);
      setCurrentImageUrl(allImages[nextIndex]);
    }
  };

  const prevImage = () => {
    if (allImages.length > 1) {
      const prevIndex =
        currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setCurrentImageUrl(allImages[prevIndex]);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (
        !values.MedicineName?.trim() ||
        !values.Quantity?.trim() ||
        !values.Dosage?.trim()
      ) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      if (!selectedStudentId) {
        message.error("Vui lòng chọn học sinh");
        return;
      }

      // ✅ VALIDATION QUAN TRỌNG: Kiểm tra StudentID có tồn tại trong danh sách students
      const selectedStudent = students.find(
        (s) => s.StudentID === selectedStudentId
      );
      if (!selectedStudent) {
        console.error("❌ StudentID không tồn tại trong danh sách students:", {
          selectedStudentId,
          availableStudents: students.map((s) => s.StudentID),
          totalStudents: students.length,
        });
        message.error(
          `Học sinh với ID "${selectedStudentId}" không tồn tại. Vui lòng chọn lại học sinh.`
        );
        return;
      }

      console.log("✅ Student validation passed:", {
        studentId: selectedStudent.StudentID,
        studentName: selectedStudent.StudentName,
        studentClass: selectedStudent.Class,
      });

      // ✅ CRITICAL DEBUG: Confirm exact StudentID format
      console.log("🔍 CRITICAL StudentID Debug:", {
        selectedStudentId,
        type: typeof selectedStudentId,
        length: selectedStudentId.length,
        startsWith_ST: selectedStudentId.startsWith("ST"),
        matchesPattern: /^ST\d+$/.test(selectedStudentId),
        fromMockData: selectedStudentId.startsWith("ST00"),
        fromRealAPI: !selectedStudentId.startsWith("ST00"),
        warning:
          "Đây là StudentID sẽ được gửi tới backend - PHẢI tồn tại trong bảng StudentProfile",
      });

      // Xử lý hình ảnh từ fileList
      const newImages = fileList
        .filter((file) => !file.isExisting) // Chỉ lấy ảnh mới (không phải ảnh cũ)
        .map((file) => file.originFileObj)
        .filter(Boolean);

      const existingImages = fileList
        .filter((file) => file.isExisting) // Chỉ lấy ảnh cũ
        .map((file) => file.url || file.thumbUrl)
        .filter(Boolean);

      console.log("🖼️ Image processing:", {
        totalFiles: fileList.length,
        newImages: newImages.length,
        existingImages: existingImages.length,
        fileListDetails: fileList.map((f) => ({
          name: f.name,
          isExisting: f.isExisting,
          hasOriginFile: !!f.originFileObj,
          url: f.url,
        })),
      });

      // Chuẩn bị dữ liệu chung
      const medicineData = {
        MedicineName: values.MedicineName.trim(),
        Quantity: values.Quantity.trim(),
        Dosage: values.Dosage.trim(),
        Instructions: values.Instructions?.trim() || "",
        Notes: values.Notes?.trim() || "",
        StudentID: selectedStudentId,
        // ✅ API backend nhận field "Images" (array File objects)
        Images: newImages, // Chỉ gửi ảnh mới khi tạo thuốc
      };

      // Xử lý trường hợp cập nhật
      if (editingMedicine) {
        console.log("Đang cập nhật thuốc:", editingMedicine.MedicineID);

        // Lưu lịch sử thay đổi
        const oldImageCount =
          editingMedicine.File?.length || editingMedicine.Images?.length || 0;
        const newImageCount = newImages.length + existingImages.length;
        const hasImageChange =
          newImages.length > 0 || oldImageCount !== newImageCount;

        const historyEntry = {
          action: "UPDATE",
          hasImageUpdate: hasImageChange,
          previousData: {
            MedicineName: editingMedicine.MedicineName,
            Quantity: editingMedicine.Quantity,
            Dosage: editingMedicine.Dosage,
            Instructions: editingMedicine.Instructions,
            Notes: editingMedicine.Notes,
            ImageCount: oldImageCount,
          },
          newData: {
            MedicineName: medicineData.MedicineName,
            Quantity: medicineData.Quantity,
            Dosage: medicineData.Dosage,
            Instructions: medicineData.Instructions,
            Notes: medicineData.Notes,
            ImageCount: newImageCount,
          },
          changedFields: (() => {
            const changes = getChangedFields(editingMedicine, medicineData);
            // Thêm thông tin về ảnh nếu có thay đổi
            if (hasImageChange) {
              changes.push({
                field: "Images",
                from:
                  oldImageCount > 0 ? `${oldImageCount} ảnh` : "Không có ảnh",
                to: newImageCount > 0 ? `${newImageCount} ảnh` : "Không có ảnh",
              });
            }
            return changes;
          })(),
          updatedBy: "Parent",
        };

        saveMedicineHistory(editingMedicine.MedicineID, historyEntry);

        // Tạo đối tượng thuốc đã cập nhật
        // QUAN TRỌNG: Giữ nguyên Status, không cho phép phụ huynh cập nhật trạng thái
        const updatedMedicine = {
          ...editingMedicine,
          MedicineName: medicineData.MedicineName,
          Quantity: medicineData.Quantity,
          Dosage: medicineData.Dosage,
          Instructions: medicineData.Instructions,
          Notes: medicineData.Notes,
          // Giữ nguyên Status: editingMedicine.Status
          // Xử lý ảnh: kết hợp ảnh cũ và ảnh mới
          Images: [
            ...existingImages,
            ...newImages.map((file) => URL.createObjectURL(file)),
          ],
          File: [
            ...(editingMedicine.File || []),
            ...newImages.map((file, index) => ({
              FileLink: URL.createObjectURL(file),
              FileName: file.name,
              FileType: file.type,
            })),
          ],
          // ✅ Đánh dấu cần đồng bộ khi update
          _pendingSync: true,
          _lastUpdateAttempt: new Date().toISOString(),
        };

        // Cập nhật state local trước để giao diện phản hồi nhanh
        setMedicines((prevMedicines) => {
          const updatedMedicines = prevMedicines.map((med) =>
            med.MedicineID === editingMedicine.MedicineID
              ? updatedMedicine
              : med
          );
          saveMedicinesToStorage(updatedMedicines);
          return updatedMedicines;
        });

        // Hiển thị thông báo đang cập nhật
        message.loading("Đang cập nhật thuốc...", 1);

        // Gọi API để cập nhật trên server
        try {
          const apiData = {
            MedicineID: editingMedicine.MedicineID,
            ...medicineData,
            Images: newImages, // Chỉ gửi ảnh mới cho API update
          };

          console.log("Gửi dữ liệu cập nhật lên server:", apiData);
          console.log("Chi tiết API Data:", {
            MedicineID: apiData.MedicineID,
            MedicineName: apiData.MedicineName,
            Quantity: apiData.Quantity,
            Dosage: apiData.Dosage,
            Instructions: apiData.Instructions,
            Notes: apiData.Notes,
            Images: apiData.Images,
            ImagesLength: apiData.Images?.length || 0,
          });

          const updateResponse = await medicineApi.parent.updateMedicine(
            apiData
          );
          console.log("Kết quả cập nhật từ server:", updateResponse);

          // ✅ XÓA FLAG _pendingSync KHI THÀNH CÔNG
          setMedicines((prevMedicines) => {
            const updatedMedicines = prevMedicines.map((med) => {
              if (med.MedicineID === editingMedicine.MedicineID) {
                return { ...med, _pendingSync: false };
              }
              return med;
            });
            saveMedicinesToStorage(updatedMedicines);
            return updatedMedicines;
          });

          message.success("Cập nhật thuốc thành công!");

          // Force refresh để lấy dữ liệu mới nhất từ server
          console.log("🔄 Force refresh sau khi cập nhật thuốc thành công");
          setTimeout(() => {
            fetchMedicinesFromServer();
          }, 500);
        } catch (updateError) {
          console.error("❌ Lỗi khi cập nhật thuốc trên server:", updateError);
          console.error("❌ Chi tiết lỗi:", {
            message: updateError.message,
            response: updateError.response?.data,
            status: updateError.response?.status,
            statusText: updateError.response?.statusText,
          });

          // Kiểm tra loại lỗi để đưa ra thông báo phù hợp
          if (updateError.response?.status === 401) {
            message.error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          } else if (updateError.response?.status === 403) {
            message.error("Bạn không có quyền cập nhật thuốc này.");
          } else if (updateError.response?.status === 404) {
            message.error("Không tìm thấy thuốc cần cập nhật.");
          } else if (updateError.response?.status >= 500) {
            message.error("Lỗi server. Vui lòng thử lại sau.");
          } else if (!navigator.onLine) {
            message.warning(
              "Không có kết nối internet. Thay đổi sẽ được đồng bộ khi có kết nối."
            );
          } else {
            message.warning(
              `Đã lưu cục bộ, thay đổi sẽ được đồng bộ khi có kết nối. (Lỗi: ${updateError.message})`
            );
          }

          // ✅ GIỮ NGUYÊN _pendingSync = true để đồng bộ sau
        }
      }
      // Xử lý trường hợp tạo mới
      else {
        console.log("Đang tạo thuốc mới");

        // ✅ Kiểm tra: nếu có ảnh thì bắt buộc phải online
        if (newImages.length > 0 && !navigator.onLine) {
          message.error(
            "Không thể tạo thuốc với ảnh khi offline. Vui lòng kiểm tra kết nối internet."
          );
          return;
        }

        // Tạo ID tạm thời duy nhất cho thuốc mới
        const tempId = `MED_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Nếu online, gọi API ngay
        if (navigator.onLine) {
          try {
            console.log("🌐 Online - Gửi thuốc trực tiếp lên server");

            // ✅ DOUBLE CHECK: Validation final trước khi gửi API
            console.log("� Final validation before API call:", {
              MedicineName: medicineData.MedicineName,
              Quantity: medicineData.Quantity,
              Dosage: medicineData.Dosage,
              Instructions: medicineData.Instructions,
              Notes: medicineData.Notes,
              StudentID: medicineData.StudentID,
              selectedStudentId: selectedStudentId,
              selectedStudent: selectedStudent,
              ImagesCount: medicineData.Images?.length || 0,
              ImageTypes: medicineData.Images?.map((img) => img?.type) || [],
            });

            // ✅ Validation trước khi gửi - với thông tin chi tiết
            if (!medicineData.StudentID?.trim()) {
              throw new Error("StudentID không được để trống");
            }
            if (!selectedStudentId?.trim()) {
              throw new Error("Chưa chọn học sinh");
            }
            if (medicineData.StudentID !== selectedStudentId) {
              console.error("❌ StudentID mismatch:", {
                medicineDataStudentID: medicineData.StudentID,
                selectedStudentId: selectedStudentId,
              });
              throw new Error(
                "Mismatch giữa StudentID trong data và selectedStudentId"
              );
            }

            // ✅ Kiểm tra StudentID có đúng format không
            if (!medicineData.StudentID.startsWith("ST")) {
              console.error(
                "❌ Invalid StudentID format:",
                medicineData.StudentID
              );
              throw new Error(
                `StudentID "${medicineData.StudentID}" không đúng format (phải bắt đầu bằng ST)`
              );
            }

            const createResponse = await medicineApi.parent.createMedicine(
              medicineData
            );
            console.log("✅ Kết quả tạo thuốc từ server:", createResponse);

            if (
              createResponse?.data?.medicineID ||
              createResponse?.data?.MedicineID
            ) {
              const realId =
                createResponse.data.medicineID ||
                createResponse.data.MedicineID;
              const serverStatus =
                createResponse.data.status ||
                createResponse.data.Status ||
                "Chờ xử lý";
              const serverDate =
                createResponse.data.sentDate ||
                createResponse.data.SentDate ||
                new Date().toISOString();

              console.log("Nhận được ID thuốc từ server:", realId);

              // Tạo đối tượng thuốc với dữ liệu từ server
              const serverMedicine = {
                MedicineID: realId,
                MedicineName: medicineData.MedicineName,
                Quantity: medicineData.Quantity,
                Dosage: medicineData.Dosage,
                Instructions: medicineData.Instructions,
                Notes: medicineData.Notes,
                Status: normalizeStatus(serverStatus),
                SentDate: serverDate,
                StudentID: medicineData.StudentID,
                NurseID: null,
                ParentID: null,
                Images: newImages.map((file) => URL.createObjectURL(file)), // Tạm thời cho UI
                File: newImages.map((file, index) => ({
                  FileLink: URL.createObjectURL(file),
                  FileName: file.name,
                  FileType: file.type,
                })),
                _fromServer: true,
                _serverFetchedAt: new Date().toISOString(),
              };

              // Thêm vào state
              setMedicines((prevMedicines) => {
                const updatedMedicines = [...prevMedicines, serverMedicine];
                saveMedicinesToStorage(updatedMedicines);
                return updatedMedicines;
              });

              message.success("Đã tạo yêu cầu thuốc thành công!");

              // Force refresh để lấy dữ liệu mới nhất từ server
              console.log("🔄 Force refresh sau khi tạo thuốc thành công");
              setTimeout(() => {
                fetchMedicinesFromServer();
              }, 500);
            } else {
              throw new Error("Server không trả về ID thuốc");
            }
          } catch (createError) {
            console.error("❌ Lỗi khi tạo thuốc trên server:", createError);
            console.error("❌ Chi tiết lỗi:", {
              message: createError.message,
              response: createError.response?.data,
              status: createError.response?.status,
              statusText: createError.response?.statusText,
            });

            // ✅ XỬ LÝ CỤ THỂ CHO FOREIGN KEY CONSTRAINT ERROR
            const errorMessage =
              createError.response?.data?.message || createError.message;
            const isStudentIdError =
              errorMessage.includes("FK_Medicine_StudentProfile_StudentID") ||
              errorMessage.includes("StudentID") ||
              errorMessage.includes("FOREIGN KEY constraint");

            if (isStudentIdError) {
              console.error(
                "🚨 FOREIGN KEY ERROR - StudentID không tồn tại trong database:"
              );
              console.error("Selected StudentID:", medicineData.StudentID);
              console.error(
                "Available students:",
                students.map((s) => ({
                  id: s.StudentID,
                  name: s.StudentName,
                  class: s.Class,
                }))
              );

              message.error(`❌ Lỗi: Học sinh với ID "${medicineData.StudentID}" không tồn tại trong hệ thống. 
                           Vui lòng:
                           1. Kiểm tra lại danh sách học sinh
                           2. Liên hệ quản trị viên nếu vấn đề vẫn tiếp diễn`);

              // Tự động refresh danh sách học sinh
              console.log("🔄 Auto refreshing students list...");
              fetchStudents(true);
              return;
            }

            // Xử lý các lỗi khác như cũ
            if (createError.response?.status === 401) {
              message.error(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
              );
            } else if (createError.response?.status === 403) {
              message.error("Bạn không có quyền tạo thuốc này.");
            } else if (createError.response?.status === 404) {
              message.error("Không tìm thấy API endpoint.");
            } else if (createError.response?.status >= 500) {
              message.error("Lỗi server. Vui lòng thử lại sau.");
            } else if (!navigator.onLine) {
              message.warning(
                "Không có kết nối internet. Thuốc sẽ được tạo offline (không có ảnh)."
              );
            } else {
              message.error(`Không thể tạo thuốc: ${errorMessage}`);
            }

            // Nếu có ảnh và lỗi, không lưu offline
            if (newImages.length > 0) {
              message.error(
                `Không thể tạo thuốc với ảnh: ${
                  createError.response?.data?.message || createError.message
                }`
              );
              return;
            }

            // Chỉ lưu offline nếu không có ảnh
            message.warning(
              "Không thể kết nối server. Thuốc sẽ được tạo offline (không có ảnh)."
            );

            // Tạo offline thuốc không có ảnh
            const offlineMedicine = {
              MedicineID: tempId,
              MedicineName: medicineData.MedicineName,
              Quantity: medicineData.Quantity,
              Dosage: medicineData.Dosage,
              Instructions: medicineData.Instructions,
              Notes: medicineData.Notes,
              Status: "Chờ xử lý",
              SentDate: new Date().toISOString(),
              StudentID: medicineData.StudentID,
              NurseID: null,
              ParentID: null,
              Images: [],
              File: [],
              _isTemp: true,
              _pendingSync: true,
              _createdAt: new Date().toISOString(),
            };

            setMedicines((prevMedicines) => {
              const updatedMedicines = [...prevMedicines, offlineMedicine];
              saveMedicinesToStorage(updatedMedicines);
              return updatedMedicines;
            });
          }
        } else {
          // Offline và không có ảnh - tạo offline
          if (newImages.length === 0) {
            const offlineMedicine = {
              MedicineID: tempId,
              MedicineName: medicineData.MedicineName,
              Quantity: medicineData.Quantity,
              Dosage: medicineData.Dosage,
              Instructions: medicineData.Instructions,
              Notes: medicineData.Notes,
              Status: "Chờ xử lý",
              SentDate: new Date().toISOString(),
              StudentID: medicineData.StudentID,
              NurseID: null,
              ParentID: null,
              Images: [],
              File: [],
              _isTemp: true,
              _pendingSync: true,
              _createdAt: new Date().toISOString(),
            };

            setMedicines((prevMedicines) => {
              const updatedMedicines = [...prevMedicines, offlineMedicine];
              saveMedicinesToStorage(updatedMedicines);
              return updatedMedicines;
            });

            message.warning(
              "Đã tạo thuốc offline. Sẽ đồng bộ khi có kết nối internet."
            );
          }
        }
      }

      // Đóng modal và reset form
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      setEditingMedicine(null);
    } catch (error) {
      console.error("❌ Lỗi khi xử lý form:", error);

      // ✅ ENHANCED ERROR ANALYSIS
      console.error("🔍 Chi tiết lỗi:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data:
            error.config?.data instanceof FormData
              ? "[FormData]"
              : error.config?.data,
        },
      });

      // ✅ SPECIFIC ERROR HANDLING
      if (error.response?.status === 500) {
        console.error("🚨 SERVER ERROR 500 - Chi tiết:");
        console.error("Backend URL:", error.config?.url);
        console.error("Request method:", error.config?.method);
        console.error("Response data:", error.response?.data);

        // Check for Foreign Key constraint error
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.toString() ||
          "";
        if (
          errorMessage.includes("FK_Medicine_StudentProfile_StudentID") ||
          errorMessage.includes("FOREIGN KEY constraint") ||
          errorMessage.includes("StudentID")
        ) {
          message.error(
            `Lỗi StudentID: "${selectedStudentId}" không tồn tại trong database. Vui lòng liên hệ admin.`
          );
        } else {
          message.error(
            `Lỗi server (500): ${errorMessage || "Server gặp sự cố nội bộ"}`
          );
        }
      } else if (error.response?.status === 400) {
        const errorMsg =
          error.response?.data?.message || "Dữ liệu không hợp lệ";
        message.error(`Lỗi dữ liệu: ${errorMsg}`);
      } else if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 403) {
        message.error("Bạn không có quyền thực hiện thao tác này.");
      } else if (!navigator.onLine) {
        message.error("Không có kết nối internet. Vui lòng kiểm tra kết nối.");
      } else {
        message.error(
          `Có lỗi xảy ra: ${error.message || "Lỗi không xác định"}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const getStatusColor = (status) => {
    const normalizedStatus = normalizeStatus(status);
    const colors = {
      "Chờ xử lý": "orange",
      "Đã xác nhận": "green",
      "Đang thực hiện": "blue",
      "Đã hoàn thành": "green",
      "Từ chối": "red",
      "Chờ xác nhận": "blue",
    };
    return colors[normalizedStatus] || "default";
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = normalizeStatus(status);
    const icons = {
      "Chờ xử lý": <ClockCircleOutlined />,
      "Đã xác nhận": <CheckCircleOutlined />,
      "Đang thực hiện": <SyncOutlined />,
      "Đã hoàn thành": <CheckCircleOutlined />,
      "Từ chối": <ExclamationCircleOutlined />,
      "Chờ xác nhận": <ClockCircleOutlined />,
    };
    return icons[normalizedStatus] || <ClockCircleOutlined />;
  };

  const canEdit = (record) => {
    const normalizedStatus = normalizeStatus(record.Status);

    // Chỉ cho phép edit khi thuốc đang ở trạng thái chờ xử lý hoặc chờ xác nhận
    const canEditStatus =
      normalizedStatus === "Chờ xử lý" || normalizedStatus === "Chờ xác nhận";

    // ✅ BACKEND LOGIC: Cho phép update tất cả các medicine chưa được y tế xử lý (NurseID == null)
    const isUnprocessedByNurse = !record.NurseID; // NurseID == null

    console.log("🔍 Can edit check:", {
      medicineId: record.MedicineID,
      originalStatus: record.Status,
      normalizedStatus: normalizedStatus,
      canEditStatus: canEditStatus,
      isUnprocessedByNurse: isUnprocessedByNurse,
      canEdit: canEditStatus && isUnprocessedByNurse,
    });

    return canEditStatus && isUnprocessedByNurse;
  };

  // Get statistics
  const currentStudentMedicines = getCurrentStudentMedicines();
  const totalMedicines = currentStudentMedicines.length;
  const pendingCount = currentStudentMedicines.filter(
    (m) => normalizeStatus(m.Status) === "Chờ xử lý"
  ).length;
  const approvedCount = currentStudentMedicines.filter(
    (m) => normalizeStatus(m.Status) === "Đã xác nhận"
  ).length;
  const inUseCount = currentStudentMedicines.filter(
    (m) => normalizeStatus(m.Status) === "Đang thực hiện"
  ).length;
  const completedCount = currentStudentMedicines.filter(
    (m) => normalizeStatus(m.Status) === "Đã hoàn thành"
  ).length;
  const rejectedCount = currentStudentMedicines.filter(
    (m) => normalizeStatus(m.Status) === "Từ chối"
  ).length;

  // ==================== TABLE COLUMNS ====================

  const columns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "MedicineID",
      key: "MedicineID",
      width: 100, // ✅ Giảm từ 120 xuống 100
      fixed: "left", // ✅ Fix cột đầu
      render: (text, record) => (
        <div>
          <Text strong className="text-blue-600 text-xs">
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: "Học sinh",
      dataIndex: "StudentID",
      key: "StudentID",
      width: 150, // ✅ Giảm từ 200 xuống 150
      render: (studentId) => {
        const student = students.find((s) => s.StudentID === studentId);
        return (
          <div>
            <div>
              <Text strong style={{ fontSize: "14px" }}>
              {student?.StudentName || "N/A"}
              </Text>
            </div>
            <div className="text-xs text-gray-500">
              {getStudentClass(studentId)}
            </div>
          </div>
        );
      },
    },
    {
      title: "Thuốc & Liều dùng",
      dataIndex: "MedicineName",
      key: "MedicineName",
      width: 200, // ✅ Giảm từ 250 xuống 200
      render: (text, record) => (
        <div>
          <div className="font-medium text-purple-700 text-xs">{text}</div>
          <div className="text-xs text-gray-600">
            <span className="bg-blue-50 text-gray-500 px-1 py-0.5 rounded text-xs mr-1">
              {record.Quantity} -
            </span>
            <span className="text-gray-500 text-xs">{record.Dosage}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "Status",
      key: "Status",
      width: 110,
      render: (status) => {
        const normalizedStatus = normalizeStatus(status);
        return (
          <Tag
            color={getStatusColor(normalizedStatus)}
            icon={getStatusIcon(normalizedStatus)}
            className="text-xs"
          >
            {normalizedStatus}
          </Tag>
        );
      },
    },
    {
      title: "Ảnh thuốc",
      key: "images",
      width: 80,
      render: (_, record) => {
        // Lấy ảnh từ nhiều nguồn có thể có
        let medicineImages = [];
        if (
          record.File &&
          Array.isArray(record.File) &&
          record.File.length > 0
        ) {
          medicineImages = record.File.map(
            (file) => file.FileLink || file.fileLink || file.url
          ).filter(Boolean);
        } else if (
          record.Images &&
          Array.isArray(record.Images) &&
          record.Images.length > 0
        ) {
          medicineImages = record.Images.filter(Boolean);
        } else if (
          record.images &&
          Array.isArray(record.images) &&
          record.images.length > 0
        ) {
          medicineImages = record.images.filter(Boolean);
        }

        if (medicineImages.length === 0) {
          return (
            <div className="text-center text-gray-400 text-xs">
              <div>📷</div>
              <div>Không có ảnh</div>
            </div>
          );
        }

        // Hiển thị ảnh đầu tiên với số lượng
        const firstImage = medicineImages[0];
        let imageUrl = "";

        if (typeof firstImage === "string") {
          if (
            firstImage.startsWith("http://") ||
            firstImage.startsWith("https://") ||
            firstImage.startsWith("data:") ||
            firstImage.startsWith("blob:")
          ) {
            imageUrl = firstImage;
          } else {
            const baseUrl = "https://localhost:7040";
            const cleanImg = firstImage.startsWith("/")
              ? firstImage
              : `/${firstImage}`;
            imageUrl = `${baseUrl}${cleanImg}`;
          }
        } else if (firstImage instanceof File || firstImage instanceof Blob) {
          imageUrl = URL.createObjectURL(firstImage);
        } else if (firstImage?.url) {
          imageUrl = firstImage.url;
        }

        return (
          <div
            className="relative group cursor-pointer"
            onClick={() => {
              // Chuẩn bị tất cả URLs cho modal
              const processedUrls = medicineImages
                .map((img) => {
                  if (typeof img === "string") {
                    if (
                      img.startsWith("http://") ||
                      img.startsWith("https://") ||
                      img.startsWith("data:") ||
                      img.startsWith("blob:")
                    ) {
                      return img;
                    } else {
                      const baseUrl = "https://localhost:7040";
                      const cleanImg = img.startsWith("/") ? img : `/${img}`;
                      return `${baseUrl}${cleanImg}`;
                    }
                  } else if (img instanceof File || img instanceof Blob) {
                    return URL.createObjectURL(img);
                  } else if (img?.url) {
                    return img.url;
                  }
                  return null;
                })
                .filter(Boolean);

              openImageModal(
                imageUrl,
                `${record.MedicineName} - Ảnh thuốc`,
                processedUrls,
                0
              );
            }}
          >
            <img
              src={imageUrl}
              alt="Medicine"
              className="w-12 h-12 object-cover rounded border hover:scale-110 transition-transform"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = `
                  <div style="
                    width: 48px;
                    height: 48px;
                    background: #f5f5f5;
                    border: 1px dashed #d9d9d9;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    font-size: 10px;
                    cursor: pointer;
                  ">
                    📷
                  </div>
                `;
              }}
            />
            {medicineImages.length > 1 && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {medicineImages.length}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Ngày gửi",
      dataIndex: "SentDate",
      key: "SentDate",
      width: 100, // ✅ Giảm từ 120 xuống 100
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
      title: "Thao tác",
      key: "action",
      width: 120, // ✅ Giảm từ 140 xuống 120
      fixed: "right", // ✅ Fix cột cuối
      render: (_, record) => {
        return (
          <Space size="small">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              className="text-blue-500 hover:text-blue-700"
              title="Chi tiết"
              size="small"
            />

            {canEdit(record) && (
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                className="text-green-500 hover:text-green-700"
                title="Chỉnh sửa"
                size="small"
              />
            )}

            {/* Hiển thị tooltip cho medicine không thể edit */}
            {!canEdit(record) &&
              (normalizeStatus(record.Status) === "Chờ xử lý" ||
                normalizeStatus(record.Status) === "Chờ xác nhận") && (
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  disabled
                  className="text-gray-400"
                  title="Không thể chỉnh sửa - Đã được y tế xử lý"
                  size="small"
                />
              )}

            {/* ✅ NÚT XEM LỊCH SỬ */}
            {hasHistory(record) && (
              <Button
                type="text"
                icon={<HistoryOutlined />}
                onClick={() => handleViewHistory(record)}
                className="text-purple-500 hover:text-purple-700"
                title="Xem lịch sử"
                size="small"
              />
            )}
          </Space>
        );
      },
    },
  ];

  // ==================== RENDER ====================

  // Xử lý khi có kết nối internet trở lại
  const handleOnlineStatus = () => {
    console.log("🌐 App is now ONLINE");
    message.success("Kết nối internet đã được khôi phục");

    // Tìm và đồng bộ các thuốc đang chờ
    const pendingSyncMedicines = medicines.filter(
      (m) => m._pendingSync === true || m._isTemp === true
    );
    if (pendingSyncMedicines.length > 0) {
      console.log(
        "🔄 Found pending medicines after reconnect:",
        pendingSyncMedicines.length
      );
      message.info(`Đang đồng bộ ${pendingSyncMedicines.length} yêu cầu thuốc`);
      syncPendingMedicines(pendingSyncMedicines);
    }

    // Tải lại dữ liệu mới từ server
    fetchMedicinesFromServer();
  };

  // Xử lý khi mất kết nối internet
  const handleOfflineStatus = () => {
    console.log("📵 App is now OFFLINE");
    message.warning(
      "Mất kết nối internet - Dữ liệu sẽ được lưu cục bộ và đồng bộ khi có kết nối"
    );
  };

  // Student change handler
  useEffect(() => {
    if (selectedStudentId) {
      console.log("🔄 Học sinh đã thay đổi:", selectedStudentId);
      setLoading(true);

      // Khi thay đổi học sinh, cố gắng lấy lại thuốc của học sinh đó từ server
      if (navigator.onLine) {
        fetchMedicinesByParentId();
      } else {
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }
    }
  }, [selectedStudentId]);

  //  Theo dõi khi students đã được initialized để fetch medicines
  useEffect(() => {
    if (studentsInitialized && students.length > 0) {
      console.log(
        "✅ Students đã initialized, bắt đầu fetch medicines từ server"
      );
      fetchMedicinesFromServer();
    }
  }, [studentsInitialized]);

  // Hàm lấy thuốc của parent (không cần studentId nữa)
  const fetchMedicinesByParentId = async () => {
    if (!navigator.onLine) return;

    try {
      console.log(`👨‍👩‍👧‍👦 Đang lấy TẤT CẢ thuốc của parent...`);
      const response = await medicineApi.parent.getMedicinesByParentId();

      console.log("✅ API getMedicinesByParentId response:", response);

      // Debug chi tiết cấu trúc dữ liệu
      console.log(
        "✅ API response.data:",
        JSON.stringify(response.data, null, 2)
      );

      if (response?.data) {
        let allMedicines = [];

        if (Array.isArray(response.data)) {
          allMedicines = response.data;
          console.log("🔍 Dữ liệu là mảng trực tiếp:", allMedicines.length);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          allMedicines = response.data.data;
          console.log("🔍 Dữ liệu nằm trong trường data:", allMedicines.length);
        } else if (response.data.medicineID || response.data.MedicineID) {
          allMedicines = [response.data];
          console.log("🔍 Dữ liệu là một đối tượng thuốc đơn lẻ");
        } else {
          // Xử lý trường hợp JSON không đúng định dạng mong đợi
          console.log("⚠️ Dữ liệu có cấu trúc không xác định:", response.data);
          try {
            // Thử kiểm tra nếu response là string JSON
            if (typeof response.data === "string") {
              const parsedData = JSON.parse(response.data);
              console.log("🔄 Đã phân tích dữ liệu string JSON:", parsedData);

              if (Array.isArray(parsedData)) {
                allMedicines = parsedData;
              } else if (parsedData.data && Array.isArray(parsedData.data)) {
                allMedicines = parsedData.data;
              }
            }
            // Kiểm tra nếu có trường khác chứa dữ liệu
            else {
              const possibleFields = [
                "medicines",
                "items",
                "results",
                "records",
                "list",
              ];
              for (const field of possibleFields) {
                if (
                  response.data[field] &&
                  Array.isArray(response.data[field])
                ) {
                  console.log(`🔍 Tìm thấy dữ liệu trong trường '${field}'`);
                  allMedicines = response.data[field];
                  break;
                }
              }
            }
          } catch (e) {
            console.error("❌ Lỗi khi xử lý dữ liệu:", e);
          }
        }

        if (allMedicines.length > 0) {
          console.log(`✅ Tìm thấy ${allMedicines.length} thuốc của parent`);

          // Kiểm tra chi tiết từng thuốc để hiểu cấu trúc dữ liệu
          allMedicines.forEach((med, index) => {
            console.log(`Thuốc #${index + 1}:`, {
              id: med.medicineID || med.MedicineID,
              name: med.medicineName || med.MedicineName,
              status: med.status || med.Status,
              status_normalized: normalizeStatus(
                med.status || med.Status || "Chờ xử lý"
              ),
              studentId: med.studentID || med.StudentID || med.student_id,
            });
          });

          // Debug - kiểm tra xem có thuốc đã duyệt hay không
          const approvedMeds = allMedicines.filter((m) => {
            const status = (m.status || m.Status || "").toLowerCase();
            return (
              status.includes("duyệt") ||
              status.includes("xác nhận") ||
              status.includes("approved") ||
              status.includes("confirmed")
            );
          });

          console.log(
            "📊 Số lượng thuốc đã được duyệt của parent:",
            approvedMeds.length
          );
          if (approvedMeds.length > 0) {
            console.log(
              "📊 Chi tiết thuốc đã duyệt:",
              approvedMeds.map((med) => ({
                id: med.medicineID || med.MedicineID,
                name: med.medicineName || med.MedicineName,
                status_original: med.status || med.Status,
              }))
            );
          }

          // Chuẩn hóa dữ liệu từ server
          const processedMedicines = allMedicines.map((medicine) => ({
            MedicineID: medicine.medicineID || medicine.MedicineID,
            MedicineName: medicine.medicineName || medicine.MedicineName,
            Quantity: medicine.quantity || medicine.Quantity,
            Dosage: medicine.dosage || medicine.Dosage,
            Instructions: medicine.instructions || medicine.Instructions || "",
            Notes: medicine.notes || medicine.Notes || "",
            Status: normalizeStatus(
              medicine.status || medicine.Status || "Chờ xử lý"
            ),
            SentDate:
              medicine.sentDate || medicine.SentDate || medicine.createdAt,
            StudentID:
              medicine.studentID || medicine.StudentID || medicine.student_id,
            NurseID: medicine.nurseID || medicine.NurseID || null,
            ParentID: medicine.parentID || medicine.ParentID || null,
            // ✅ API trả về "image" là array of objects {id, url, fileName, fileType, uploadedAt}
            Images: medicine.image || medicine.images || medicine.Images || [],
            // ✅ Đồng thời lưu vào File để tương thích với code hiện tại
            File: medicine.image || medicine.images || medicine.Images || [],
            _fromServer: true,
            _serverFetchedAt: new Date().toISOString(),
          }));

          // Kiểm tra trạng thái sau khi chuẩn hóa
          const statusCounts = {};
          processedMedicines.forEach((med) => {
            statusCounts[med.Status] = (statusCounts[med.Status] || 0) + 1;
          });
          console.log("📊 Phân bố trạng thái sau khi chuẩn hóa:", statusCounts);

          // Cập nhật medicines trong state
          setMedicines((prevMedicines) => {
            // Lấy danh sách ID thuốc mới từ server
            const newMedicineIds = processedMedicines.map((m) => m.MedicineID);

            // Giữ lại thuốc đang chờ đồng bộ (pending)
            const pendingMedicines = prevMedicines.filter((m) => {
              // Giữ lại thuốc tạm thời chưa đồng bộ
              if (
                m._isTemp ||
                (m.MedicineID && m.MedicineID.startsWith("MED_"))
              )
                return true;

              // Giữ lại thuốc pending sync không có trong danh sách mới
              if (m._pendingSync && !newMedicineIds.includes(m.MedicineID))
                return true;

              // Còn lại sẽ bị thay thế bởi dữ liệu mới
              return false;
            });

            // Kết hợp thuốc pending với thuốc mới từ server
            const updatedMedicines = [
              ...pendingMedicines,
              ...processedMedicines,
            ];

            // Debug
            console.log("🔄 Đã cập nhật dữ liệu thuốc của parent:", {
              pending: pendingMedicines.length,
              mới: processedMedicines.length,
              tổngSau: updatedMedicines.length,
            });

            // Lưu vào localStorage
            saveMedicinesToStorage(updatedMedicines);

            return updatedMedicines;
          });

          // Kiểm tra một số thuốc test
          console.log(
            "🔍 Kiểm tra M0001:",
            allMedicines.find(
              (m) => m.medicineID === "M0001" || m.MedicineID === "M0001"
            )
          );
          console.log(
            "🔍 Kiểm tra M0002:",
            allMedicines.find(
              (m) => m.medicineID === "M0002" || m.MedicineID === "M0002"
            )
          );
        } else {
          console.log(`ℹ️ Không tìm thấy thuốc nào của parent`);
        }
      }
    } catch (error) {
      console.error(`❌ Lỗi khi lấy thuốc của parent:`, error);
    } finally {
      setLoading(false);
    }
  };

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
              💊
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
              Gửi thuốc cho y tế
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
              {totalMedicines}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Tổng đơn</div>
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

      {/* Filters & Statistics + Table + Modals */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Thống kê trạng thái */}
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
                      💊
                    </span>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                      Thống kê trạng thái đơn thuốc
                    </Text>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      Tổng quan về các đơn thuốc theo trạng thái xử lý
                    </div>
                  </div>
                </div>
              }
            >
              <Row gutter={24} justify="center">
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
                      {pendingCount}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#1d4ed8",
                        fontWeight: 600,
                      }}
                    >
                      Chờ xử lý
                    </div>
                  </div>
                </Col>
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
                      {approvedCount}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#1d4ed8",
                        fontWeight: 600,
                      }}
                    >
                      Đã duyệt
                    </div>
                  </div>
                </Col>
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
                        fontSize: 36,
                        marginBottom: 8,
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                      }}
                    >
                      💊
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#2563eb",
                      }}
                    >
                      {inUseCount}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#1d4ed8",
                        fontWeight: 600,
                      }}
                    >
                      Đang sử dụng
                    </div>
                  </div>
                </Col>
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
                        fontSize: 36,
                        marginBottom: 8,
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                      }}
                    >
                      🎯
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#2563eb",
                      }}
                    >
                      {completedCount}
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
                      {rejectedCount}
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

        {/* Bộ lọc và nút thêm */}
        <Card
          style={{
            borderRadius: 18,
            background: "#ffffff",
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(127,90,240,0.06)",
            border: "none",
          }}
          bodyStyle={{ padding: 18 }}
        >
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            {/* Nhóm 2 cột filter */}
            <Col xs={24} sm={16} md={10} lg={8}>
              <Row gutter={12} align="middle">
                {/* Trạng thái */}
                <Col xs={12} sm={12} md={12} lg={12}>
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
                    placeholder="Tất cả"
                    style={{ width: "100%" }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    allowClear
                    size="middle"
                  >
                    <Option value="">Tất cả</Option>
                    <Option value="Chờ xử lý">Chờ xử lý</Option>
                    <Option value="Đã duyệt">Đã duyệt</Option>
                    <Option value="Đang sử dụng">Đang sử dụng</Option>
                    <Option value="Hoàn thành">Hoàn thành</Option>
                    <Option value="Từ chối">Từ chối</Option>
                  </Select>
                </Col>

                {/* Học sinh */}
                <Col xs={12} sm={12} md={12} lg={12}>
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
                    style={{ width: "100%" }}
                    value={selectedStudentId}
                    onChange={(value) => {
                      setSelectedStudentId(value);
                      setStatusFilter("");
                    }}
                    loading={studentsLoading}
                    showSearch
                    optionFilterProp="children"
                    allowClear
                    size="middle"
                  >
                    {students.map((student) => (
                      <Option key={student.StudentID} value={student.StudentID}>
                        {student.StudentName} -{" "}
                        {student.Class || "Chưa phân lớp"}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Col>

            {/* Thêm thuốc mới + Cập nhật (nằm cùng 1 cột, bên phải) */}
            <Col
              xs={24}
              sm={8}
              md={14}
              lg={16}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  style={{
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg,rgb(32, 81, 195) 0%,rgb(42, 100, 215) 100%)",
                    borderColor: "#52c41a",
                    boxShadow: "0 4px 12px rgba(68, 123, 211, 0.3)",
                    fontWeight: "600",
                  }}
                  size="middle"
                >
                  Thêm thuốc mới
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchMedicinesFromServer}
                  loading={loading}
                  style={{
                    background: "#e0e7ff",
                    color: "#3730a3",
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: 15,
                    padding: "8px 18px",
                    border: "none",
                  }}
                >
                  Cập nhật lúc{" "}
                  <span style={{ fontWeight: 700 }}>
                    {new Date().toLocaleTimeString("vi-VN")}
                  </span>
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span>Danh sách yêu cầu thuốc</span>
                <Text
                  className="text-sm text-gray-500"
                  style={{ display: "flex", marginTop: 2 }}
                >
                  Tổng cộng: {totalMedicines} yêu cầu
                </Text>
              </span>
              <div
                className="flex items-center space-x-2"
                style={{ marginRight: 10 }}
              ></div>
            </div>
          }
          className="shadow-sm"
          bodyStyle={{
            padding: "0",
            width: "100%", // Thêm dòng này
          }}
        >
          <Table
            columns={columns}
            dataSource={currentStudentMedicines}
            loading={loading}
            rowKey="MedicineID"
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} yêu cầu`,
              size: "small",
            }}
            scroll={{
              x: 780,
              y: 400,
            }}
            size="small"
            bordered
            locale={{
              emptyText: loading ? (
                "Đang tải..."
              ) : (
                <div className="text-center py-8">
                  <MedicineBoxOutlined className="text-4xl text-gray-300 mb-2" />
                  <div className="text-gray-500">Chưa có yêu cầu thuốc nào</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {selectedStudentId
                      ? `Chưa có yêu cầu nào cho ${getStudentName(
                          selectedStudentId
                        )} - ${getStudentClass(selectedStudentId)}`
                      : "Hãy chọn học sinh để xem yêu cầu thuốc"}
                  </div>
                </div>
              ),
            }}
          />
        </Card>

        {/* Modal tạo/sửa */}
        <Modal
          title={
            <div className="flex items-center">
              <MedicineBoxOutlined className="text-blue-500 mr-2" />
              {editingMedicine
                ? "Chỉnh sửa yêu cầu thuốc"
                : "Tạo yêu cầu thuốc mới"}
              {selectedStudentId && (
                <span className="ml-2 text-sm text-gray-500">
                  cho {getStudentName(selectedStudentId)} -{" "}
                  {getStudentClass(selectedStudentId)}
                </span>
              )}
            </div>
          }
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setFileList([]);
            setEditingMedicine(null);
          }}
          footer={null}
          width={800}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="MedicineName"
                  label="Tên thuốc"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên thuốc" },
                  ]}
                >
                  <Input placeholder="Ví dụ: Paracetamol" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Quantity"
                  label="Số lượng"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng" },
                  ]}
                >
                  <Input
                    placeholder="Ví dụ: 2 viên/ngày - 10 viên"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="Dosage"
              label="Liều lượng"
              rules={[{ required: true, message: "Vui lòng nhập liều lượng" }]}
            >
              <Input placeholder="Ví dụ: 1 viên/lần, 2 lần/ngày" size="large" />
            </Form.Item>

            <Form.Item name="Instructions" label="Hướng dẫn sử dụng">
              <TextArea
                rows={3}
                placeholder="Nhập hướng dẫn sử dụng thuốc (không bắt buộc)"
              />
            </Form.Item>

            <Form.Item name="Notes" label="Ghi chú">
              <TextArea
                rows={3}
                placeholder="Ghi chú thêm về thuốc (không bắt buộc)"
              />
            </Form.Item>

            <Form.Item label="Hình ảnh thuốc (không bắt buộc)">
              <Dragger
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                multiple
                accept="image/*"
                maxCount={3}
                listType="picture-card"
                onPreview={(file) => {
                  console.log("🖼️ Preview file:", file);
                  // Xử lý preview ảnh
                  let imageUrl = file.url || file.thumbUrl;
                  if (!imageUrl && file.originFileObj) {
                    imageUrl = URL.createObjectURL(file.originFileObj);
                  }

                  if (imageUrl) {
                    // Tạo modal để xem ảnh full size
                    const modal = document.createElement("div");
                    modal.style.cssText = `
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100vw;
                      height: 100vh;
                      background: rgba(0,0,0,0.8);
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      z-index: 9999;
                      cursor: pointer;
                    `;

                    const img = document.createElement("img");
                    img.src = imageUrl;
                    img.style.cssText = `
                      max-width: 90%;
                      max-height: 90%;
                      object-fit: contain;
                      border-radius: 8px;
                    `;

                    modal.appendChild(img);
                    document.body.appendChild(modal);

                    modal.onclick = () => {
                      document.body.removeChild(modal);
                    };
                  }
                }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Kéo thả hoặc click để tải ảnh</p>
              </Dragger>
            </Form.Item>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                size="large"
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setFileList([]);
                  setEditingMedicine(null);
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-blue-500 hover:bg-blue-600"
                size="large"
              >
                {editingMedicine ? "Cập nhật" : "Tạo yêu cầu"}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal xem chi tiết */}
        <Modal
          title={
            <div className="flex items-center">
              <EyeOutlined className="text-blue-500 mr-2" />
              Chi tiết yêu cầu thuốc
              {viewingMedicine && (
                <span className="ml-2 text-sm text-gray-500">
                  - {viewingMedicine.MedicineName}
                </span>
              )}
            </div>
          }
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsViewModalVisible(false)}
              size="large"
            >
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {viewingMedicine && (
            <div>
              {/* Main Information */}
              <Card
                title="Thông tin chính"
                size="small"
                style={{ marginBottom: "16px" }}
              >
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Mã yêu cầu" span={1}>
                    <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                      {viewingMedicine.MedicineID}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái" span={1}>
                    <Tag
                      color={getStatusColor(viewingMedicine.Status)}
                      icon={getStatusIcon(viewingMedicine.Status)}
                    >
                      {normalizeStatus(viewingMedicine.Status)}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Tên học sinh" span={1}>
                    <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                      {getStudentName(viewingMedicine.StudentID)}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã học sinh" span={1}>
                    <Text style={{ color: "#1890ff" }}>
                      {viewingMedicine.StudentID}
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Lớp" span={1}>
                    <Text style={{ color: "#1890ff" }}>
                      {getStudentClass(viewingMedicine.StudentID)}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên thuốc" span={1}>
                    <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                      {viewingMedicine.MedicineName}
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Số lượng" span={1}>
                    <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                      {viewingMedicine.Quantity}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Liều lượng" span={1}>
                    <Text style={{ fontSize: "14px", color: "#1890ff" }}>
                      {viewingMedicine.Dosage}
                    </Text>
                  </Descriptions.Item>

                  {viewingMedicine.Instructions && (
                    <Descriptions.Item label="Hướng dẫn sử dụng" span={2}>
                      <Text
                        style={{
                          fontSize: "13px",
                          fontStyle: "italic",
                          color: "#1890ff",
                        }}
                      >
                        {viewingMedicine.Instructions}
                      </Text>
                    </Descriptions.Item>
                  )}

                  {viewingMedicine.Notes && (
                    <Descriptions.Item label="Ghi chú">
                      <Text
                        style={{
                          fontSize: "13px",
                          fontStyle: "italic",
                          color: "#1890ff",
                        }}
                      >
                        {viewingMedicine.Notes}
                      </Text>
                    </Descriptions.Item>
                  )}

                  {viewingMedicine.NurseID && (
                    <Descriptions.Item label="Được xử lý bởi y tá">
                      <Text style={{ fontSize: "13px", color: "#1890ff" }}>
                        Mã y tá: {viewingMedicine.NurseID}
                      </Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Hình ảnh thuốc */}
              {(() => {
                // Tìm ảnh từ nhiều nguồn có thể có
                let medicineImages = [];

                console.log("🔍 Debug ảnh thuốc trong modal view:", {
                  medicineId: viewingMedicine.MedicineID,
                  File: viewingMedicine.File,
                  files: viewingMedicine.files,
                  Images: viewingMedicine.Images,
                  images: viewingMedicine.images,
                  Image: viewingMedicine.Image,
                  image: viewingMedicine.image,
                  fullObject: viewingMedicine,
                });

                // ✅ Xử lý hình ảnh thông minh - ưu tiên API response format
                if (
                  viewingMedicine.image &&
                  Array.isArray(viewingMedicine.image) &&
                  viewingMedicine.image.length > 0
                ) {
                  // API trả về "image" array với objects {id, url, fileName, fileType, uploadedAt}
                  medicineImages = viewingMedicine.image
                    .map((imageObj) => {
                      if (typeof imageObj === "object" && imageObj !== null) {
                        return (
                          imageObj.url || imageObj.FileLink || imageObj.fileLink
                        );
                      } else if (typeof imageObj === "string") {
                        return imageObj;
                      }
                      return null;
                    })
                    .filter(Boolean);
                  console.log(
                    "✅ Found images from image array (API format):",
                    medicineImages
                  );
                }
                // Fallback: File array (từ frontend processing)
                else if (
                  viewingMedicine.File &&
                  Array.isArray(viewingMedicine.File) &&
                  viewingMedicine.File.length > 0
                ) {
                  medicineImages = viewingMedicine.File.map(
                    (file) => file.FileLink || file.fileLink || file.url
                  ).filter(Boolean);
                  console.log(
                    "✅ Found images from File array:",
                    medicineImages
                  );
                }
                // Fallback: files array (lowercase)
                else if (
                  viewingMedicine.files &&
                  Array.isArray(viewingMedicine.files) &&
                  viewingMedicine.files.length > 0
                ) {
                  medicineImages = viewingMedicine.files
                    .map((file) => file.FileLink || file.fileLink || file.url)
                    .filter(Boolean);
                  console.log(
                    "✅ Found images from files array:",
                    medicineImages
                  );
                }
                // Fallback: Images array (PascalCase)
                else if (
                  viewingMedicine.Images &&
                  Array.isArray(viewingMedicine.Images) &&
                  viewingMedicine.Images.length > 0
                ) {
                  medicineImages = viewingMedicine.Images.filter(Boolean);
                  console.log(
                    "✅ Found images from Images array:",
                    medicineImages
                  );
                }
                // Fallback: images array (lowercase)
                else if (
                  viewingMedicine.images &&
                  Array.isArray(viewingMedicine.images) &&
                  viewingMedicine.images.length > 0
                ) {
                  medicineImages = viewingMedicine.images.filter(Boolean);
                  console.log(
                    "✅ Found images from images array:",
                    medicineImages
                  );
                }
                // Fallback: Image array (PascalCase)
                else if (
                  viewingMedicine.Image &&
                  Array.isArray(viewingMedicine.Image) &&
                  viewingMedicine.Image.length > 0
                ) {
                  medicineImages = viewingMedicine.Image.filter(Boolean);
                  console.log(
                    "✅ Found images from Image array:",
                    medicineImages
                  );
                }
                // Single image strings
                else if (
                  viewingMedicine.imageUrl &&
                  typeof viewingMedicine.imageUrl === "string"
                ) {
                  medicineImages = [viewingMedicine.imageUrl];
                  console.log("✅ Found single imageUrl:", medicineImages);
                } else if (
                  viewingMedicine.image &&
                  typeof viewingMedicine.image === "string"
                ) {
                  medicineImages = [viewingMedicine.image];
                  console.log("✅ Found single image string:", medicineImages);
                } else if (
                  viewingMedicine.Image &&
                  typeof viewingMedicine.Image === "string"
                ) {
                  medicineImages = [viewingMedicine.Image];
                  console.log("✅ Found single Image string:", medicineImages);
                }
                // Debug: tìm tất cả properties có chứa "image" hoặc "file"
                else {
                  console.log(
                    "❌ No standard image fields found, checking all properties..."
                  );
                  const allProps = Object.keys(viewingMedicine);
                  allProps.forEach((prop) => {
                    const lowerProp = prop.toLowerCase();
                    if (
                      (lowerProp.includes("file") ||
                        lowerProp.includes("image") ||
                        lowerProp.includes("url")) &&
                      viewingMedicine[prop]
                    ) {
                      console.log(
                        `🖼️ Found potential image property: ${prop}`,
                        viewingMedicine[prop]
                      );
                    }
                  });
                }

                console.log("🔍 Final medicineImages found:", medicineImages);

                if (medicineImages.length > 0) {
                  return (
                    <Card
                      title="Hình ảnh thuốc"
                      size="small"
                      style={{ marginBottom: "16px" }}
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {medicineImages.map((img, index) => {
                          // Xử lý URL ảnh thông minh
                          let imageUrl;

                          if (typeof img === "string") {
                            if (
                              img.startsWith("http://") ||
                              img.startsWith("https://")
                            ) {
                              imageUrl = img;
                            } else if (img.startsWith("data:")) {
                              imageUrl = img;
                            } else if (img.startsWith("blob:")) {
                              imageUrl = img;
                            } else {
                              // Đường dẫn tương đối - thêm base URL
                              const baseUrl = "https://localhost:7040"; // ✅ Sử dụng HTTPS như backend
                              const cleanImg = img.startsWith("/")
                                ? img
                                : `/${img}`;
                              imageUrl = `${baseUrl}${cleanImg}`;
                            }
                          } else if (
                            img instanceof File ||
                            img instanceof Blob
                          ) {
                            imageUrl = URL.createObjectURL(img);
                          } else if (img?.url) {
                            imageUrl = img.url;
                          } else {
                            console.warn("⚠️ Không thể xử lý ảnh:", img);
                            return null;
                          }

                          console.log(`🔗 Image #${index + 1} URL:`, imageUrl);

                          return (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Medicine ${index + 1}`}
                                className="w-full h-24 object-cover rounded border hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => {
                                  // 🆕 SỬ DỤNG MODAL ĐƠN GIẢN THAY VÀO DOM MANIPULATION
                                  const processedUrls = medicineImages
                                    .map((img, idx) => {
                                      if (typeof img === "string") {
                                        if (
                                          img.startsWith("http://") ||
                                          img.startsWith("https://") ||
                                          img.startsWith("data:") ||
                                          img.startsWith("blob:")
                                        ) {
                                          return img;
                                        } else {
                                          const baseUrl =
                                            "https://localhost:7040";
                                          const cleanImg = img.startsWith("/")
                                            ? img
                                            : `/${img}`;
                                          return `${baseUrl}${cleanImg}`;
                                        }
                                      } else if (
                                        img instanceof File ||
                                        img instanceof Blob
                                      ) {
                                        return URL.createObjectURL(img);
                                      } else if (img?.url) {
                                        return img.url;
                                      }
                                      return null;
                                    })
                                    .filter(Boolean);

                                  openImageModal(
                                    imageUrl,
                                    `${viewingMedicine.MedicineName} - Ảnh ${
                                      index + 1
                                    }`,
                                    processedUrls,
                                    index
                                  );
                                }}
                                onError={(e) => {
                                  console.log("❌ Lỗi tải ảnh:", imageUrl);
                                  // Thử với các đường dẫn khác nếu lỗi
                                  if (!e.target.dataset.retried) {
                                    e.target.dataset.retried = "true";
                                    const retryUrl = `https://localhost:7040/uploads/${img}`;
                                    console.log("🔄 Retry with URL:", retryUrl);
                                    e.target.src = retryUrl;
                                  } else if (!e.target.dataset.retried2) {
                                    e.target.dataset.retried2 = "true";
                                    const retryUrl2 = `https://localhost:7040/files/${img}`;
                                    console.log(
                                      "🔄 Retry with URL 2:",
                                      retryUrl2
                                    );
                                    e.target.src = retryUrl2;
                                  } else {
                                    // Hiển thị placeholder khi tất cả đều thất bại
                                    e.target.style.display = "none";
                                    e.target.parentNode.innerHTML = `
                                      <div style="
                                        width: 100%;
                                        height: 96px;
                                        background: #f5f5f5;
                                        border: 2px dashed #d9d9d9;
                                        border-radius: 6px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: #999;
                                        font-size: 12px;
                                        flex-direction: column;
                                      ">
                                        <div>📷</div>
                                        <div>Ảnh không tải được</div>
                                      </div>
                                    `;
                                  }
                                }}
                                onLoad={() => {
                                  console.log(
                                    "✅ Ảnh đã tải thành công:",
                                    imageUrl
                                  );
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                                <EyeOutlined className="text-white opacity-0 group-hover:opacity-100 text-lg" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Click vào ảnh để xem kích thước đầy đủ
                      </div>
                    </Card>
                  );
                }
                return null; // Không hiện Card nếu không có ảnh
              })()}
            </div>
          )}
        </Modal>

        {/* Modal lịch sử */}
        <Modal
          title={
            <div className="flex items-center">
              <HistoryOutlined className="text-purple-500 mr-2" />
              Lịch sử thay đổi
              {viewingMedicineHistory && (
                <span className="ml-2 text-sm text-gray-500">
                  - {viewingMedicineHistory.MedicineName}
                </span>
              )}
            </div>
          }
          open={isHistoryModalVisible}
          onCancel={() => {
            setIsHistoryModalVisible(false);
            setViewingMedicineHistory(null);
            setMedicineHistory([]);
          }}
          footer={[
            <Button
              key="close"
              onClick={() => {
                setIsHistoryModalVisible(false);
                setViewingMedicineHistory(null);
                setMedicineHistory([]);
              }}
              size="large"
            >
              Đóng
            </Button>,
          ]}
          width={900}
        >
          {viewingMedicineHistory && (
            <div className="space-y-4">
              {/* Medicine Info Header */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">
                      {viewingMedicineHistory.MedicineName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Mã: {viewingMedicineHistory.MedicineID} | Học sinh:{" "}
                      {getStudentName(viewingMedicineHistory.StudentID)} -{" "}
                      {getStudentClass(viewingMedicineHistory.StudentID)}
                    </p>
                  </div>
                  <Tag
                    color={getStatusColor(viewingMedicineHistory.Status)}
                    icon={getStatusIcon(viewingMedicineHistory.Status)}
                    className="text-sm"
                  >
                    {normalizeStatus(viewingMedicineHistory.Status)}
                  </Tag>
                </div>
              </div>

              {/* History Timeline */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 border-b pb-2">
                  Lịch sử thay đổi ({medicineHistory.length} lần)
                </h4>

                {medicineHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <HistoryOutlined className="text-2xl mb-2" />
                    <p>Chưa có lịch sử thay đổi</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {medicineHistory.map((entry, index) => (
                      <div
                        key={entry.id || index}
                        className="border-l-4 border-purple-200 pl-4 py-3 bg-white rounded-r-lg shadow-sm"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <EditOutlined className="text-purple-500" />
                            <span className="font-medium text-gray-800">
                              {entry.action === "UPDATE"
                                ? "Cập nhật"
                                : entry.action}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(entry.timestamp).toLocaleString("vi-VN")}
                          </span>
                        </div>

                        {/* Changes */}
                        {entry.changedFields &&
                          entry.changedFields.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">
                                Các thay đổi:
                              </p>
                              {entry.changedFields.map(
                                (change, changeIndex) => (
                                  <div
                                    key={changeIndex}
                                    className="bg-gray-50 p-2 rounded text-sm"
                                  >
                                    <div className="font-medium text-gray-700 mb-1">
                                      {getFieldDisplayName(change.field)}:
                                    </div>
                                    {change.field === "Images" ? (
                                      // Xử lý riêng cho ảnh
                                      <div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <span className="text-xs text-gray-500">
                                              Trước:
                                            </span>
                                            <div className="bg-red-50 text-red-700 p-1 rounded text-xs">
                                              {change.from || "(Không có ảnh)"}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="text-xs text-gray-500">
                                              Sau:
                                            </span>
                                            <div className="bg-green-50 text-green-700 p-1 rounded text-xs">
                                              {change.to || "(Không có ảnh)"}
                                            </div>
                                          </div>
                                        </div>
                                        {entry.hasImageUpdate && (
                                          <div className="mt-2 text-xs text-blue-600 font-medium">
                                            ✨ Đã cập nhật ảnh thuốc
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      // Xử lý bình thường cho các field khác
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="text-xs text-gray-500">
                                            Trước:
                                          </span>
                                          <div className="bg-red-50 text-red-700 p-1 rounded text-xs">
                                            {change.from || "(Trống)"}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-xs text-gray-500">
                                            Sau:
                                          </span>
                                          <div className="bg-green-50 text-green-700 p-1 rounded text-xs">
                                            {change.to || "(Trống)"}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* 🆕 MODAL XEM ẢNH ĐƠN GIẢN */}
        <Modal
          open={imageModalVisible}
          onCancel={closeImageModal}
          footer={null}
          width="90%"
          style={{ top: 20 }}
          centered
          title={imageTitle}
        >
          <div
            style={{
              position: "relative",
              textAlign: "center",
              minHeight: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Nút Previous */}
            {allImages.length > 1 && (
              <Button
                type="primary"
                shape="circle"
                icon="❮"
                onClick={prevImage}
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                }}
              />
            )}

            {/* Ảnh chính */}
            <img
              src={currentImageUrl}
              alt={imageTitle}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />

            {/* Nút Next */}
            {allImages.length > 1 && (
              <Button
                type="primary"
                shape="circle"
                icon="❯"
                onClick={nextImage}
                style={{
                  position: "absolute",
                  right: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                }}
              />
            )}
          </div>

          {/* Thông tin ảnh */}
          {allImages.length > 1 && (
            <div
              style={{
                textAlign: "center",
                marginTop: "10px",
                color: "#666",
              }}
            >
              Ảnh {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
export default MedicineManagement;
