import React, { useState, useEffect } from 'react';
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
  Popconfirm
} from 'antd';
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
} from '@ant-design/icons';
import medicineApi from '../../api/medicineApi';
import studentApi from '../../api/studentApi';


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
  const [selectedStudentId, setSelectedStudentId] = useState('');

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
  const [statusFilter, setStatusFilter] = useState('');

  // LocalStorage keys
  const MEDICINES_STORAGE_KEY = 'medicines_persistent_v4';
  const MEDICINE_HISTORY_KEY = 'medicine_history_v1';

  // Component mount
  useEffect(() => {
    console.log('🚀 Component mounting...');

    // Đảm bảo tải dữ liệu từ localStorage trước
    loadPersistedMedicines();

    // Tải danh sách học sinh trước
    // fetchMedicinesFromServer sẽ được gọi tự động khi studentsInitialized = true
    const initializeData = async () => {
      try {
        await fetchStudents();
        // Không cần gọi fetchMedicinesFromServer ở đây nữa
        // Nó sẽ được gọi tự động trong useEffect theo dõi studentsInitialized
      } catch (error) {
        console.error('❌ Lỗi khởi tạo dữ liệu:', error);
      }
    };

    initializeData();

    // Thêm listeners cho trạng thái online/offline
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    // Thêm listener cho thay đổi localStorage từ tab khác
    window.addEventListener('storage', handleStorageChange);

    // 🆕 Thêm listener để refresh khi user quay lại tab (catch updates từ nurse)
    const handleVisibilityChange = () => {
      if (!document.hidden && navigator.onLine && studentsInitialized) {
        console.log('👀 User quay lại tab, đang refresh dữ liệu để cập nhật trạng thái mới nhất...');
        setTimeout(() => {
          fetchMedicinesFromServer();
        }, 1000); // Đợi 1s để đảm bảo tab đã focus hoàn toàn
      }
    };

    const handleWindowFocus = () => {
      if (navigator.onLine && studentsInitialized) {
        console.log('🔄 Window focus, refresh dữ liệu để cập nhật trạng thái...');
        setTimeout(() => {
          fetchMedicinesFromServer();
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    // Tạo interval để cố gắng đồng bộ định kỳ và check database changes
    const syncInterval = setInterval(() => {
      if (navigator.onLine && studentsInitialized) {
        const pendingSyncMedicines = medicines.filter(m => m._pendingSync === true || m._isTemp === true);
        if (pendingSyncMedicines.length > 0) {
          console.log('⏱️ Tự động đồng bộ định kỳ:', pendingSyncMedicines.length, 'yêu cầu');
          syncPendingMedicines(pendingSyncMedicines);
        }

        // ✅ Định kỳ refresh dữ liệu để phát hiện thay đổi database (bao gồm việc xóa)
        console.log('⏱️ Định kỳ check database changes (bao gồm xóa database)');
        fetchMedicinesFromServer();
      }
    }, 30000); // ✅ Giảm từ 2 phút xuống 30 giây để phát hiện thay đổi nhanh hơn

    return () => {
      // Cleanup listeners khi component unmount
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(syncInterval);

      // Lưu lại state medicines khi component unmount để đảm bảo không mất dữ liệu
      saveMedicinesToStorage(medicines);
    };
  }, []); // 🔥 QUAN TRỌNG: Empty dependency array để chỉ chạy 1 lần khi mount

  // Xử lý khi localStorage thay đổi ở tab khác
  const handleStorageChange = (event) => {
    if (event.key === MEDICINES_STORAGE_KEY) {
      console.log('🔄 Phát hiện thay đổi dữ liệu từ tab khác, đang tải lại...');
      loadPersistedMedicines();
    }
  };

  // ==================== PERSISTENCE FUNCTIONS ====================

  const saveMedicinesToStorage = (medicinesList) => {
    try {
      // Chỉ lưu khi có dữ liệu
      if (!medicinesList || medicinesList.length === 0) {
        console.log('⚠️ Không có dữ liệu thuốc để lưu');
        return;
      }

      // Đánh dấu thời gian lưu trữ cho mỗi thuốc
      const medicinesWithTimestamp = medicinesList.map(med => ({
        ...med,
        _localSavedAt: new Date().toISOString(),
        // Đảm bảo các thuốc chưa đồng bộ được đánh dấu đúng
        _pendingSync: med._pendingSync || med._isTemp || false
      }));

      const dataToSave = {
        medicines: medicinesWithTimestamp,
        timestamp: new Date().toISOString(),
        version: '4.2' // Tăng phiên bản để đánh dấu cải tiến lưu trữ
      };

      localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('💾 Lưu trữ thành công:', medicinesList.length, 'thuốc');
    } catch (error) {
      console.error('❌ Lỗi khi lưu thuốc:', error);
    }
  };

  const loadPersistedMedicines = () => {
    try {
      console.log('📂 Đang tải dữ liệu thuốc từ bộ nhớ cục bộ...');
      const cached = localStorage.getItem(MEDICINES_STORAGE_KEY);

      if (!cached) {
        console.log('⚠️ Không có dữ liệu thuốc được lưu trữ');
        return false;
      }

      const parsedData = JSON.parse(cached);
      const medicinesList = parsedData.medicines || parsedData;

      if (!Array.isArray(medicinesList) || medicinesList.length === 0) {
        console.log('⚠️ Không có thuốc nào trong dữ liệu lưu trữ');
        return false;
      }

      // Đánh dấu và kiểm tra các thuốc cần đồng bộ
      const medicinesWithFlags = medicinesList.map(med => ({
        ...med,
        // Đảm bảo thuốc có ID tạm thời vẫn được đánh dấu là cần đồng bộ
        _pendingSync: med._pendingSync || (med.MedicineID && med.MedicineID.startsWith('MED_')) || med._isTemp || false,
        _isTemp: med._isTemp || (med.MedicineID && med.MedicineID.startsWith('MED_')) || false
      }));

      // Cập nhật state
      setMedicines(medicinesWithFlags);
      console.log('✅ Đã tải', medicinesWithFlags.length, 'thuốc từ bộ nhớ cục bộ');

      // Tìm các thuốc cần đồng bộ
      const pendingSyncMedicines = medicinesWithFlags.filter(m => m._pendingSync === true || m._isTemp === true);
      if (pendingSyncMedicines.length > 0) {
        console.log('🔄 Phát hiện', pendingSyncMedicines.length, 'thuốc chưa đồng bộ');
        if (navigator.onLine) {
          console.log('🌐 Đang online - Bắt đầu đồng bộ...');
          syncPendingMedicines(pendingSyncMedicines);
        } else {
          console.log('📵 Đang offline - Sẽ đồng bộ khi có kết nối');
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Lỗi khi tải dữ liệu thuốc:', error);
      return false;
    }
  };

  const updateMedicinesWithPersistence = (newMedicines) => {
    console.log('🔄 Updating medicines with persistence:', newMedicines.length);
    setMedicines(newMedicines);
    saveMedicinesToStorage(newMedicines);
  };

  // Hàm đồng bộ các thuốc đang chờ khi có kết nối
  const syncPendingMedicines = async (pendingMedicines) => {
    if (!pendingMedicines || pendingMedicines.length === 0) return;

    console.log('🔄 Attempting to sync pending medicines:', pendingMedicines.length);

    // Kiểm tra kết nối internet
    if (!navigator.onLine) {
      console.log('❌ No internet connection, sync postponed');
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
          Instructions: medicine.Instructions || '',
          Notes: medicine.Notes || '',
          StudentID: medicine.StudentID,
          // Không gửi Images vì URL đã được tạo local và không thể gửi lên server
        };

        // Nếu là thuốc mới (tạm thời)
        if (medicine._isTemp) {
          console.log('🆕 Creating new medicine on server');
          const createResponse = await medicineApi.parent.createMedicine(syncData);

          if (createResponse?.data?.medicineID || createResponse?.data?.MedicineID) {
            const realId = createResponse.data.medicineID || createResponse.data.MedicineID;

            // Cập nhật ID thật và xóa trạng thái tạm
            setMedicines(prevMedicines => {
              const updatedMedicines = prevMedicines.map(med => {
                if (med.MedicineID === medicine.MedicineID) {
                  return {
                    ...med,
                    MedicineID: realId,
                    _isTemp: false,
                    _pendingSync: false
                  };
                }
                return med;
              });
              saveMedicinesToStorage(updatedMedicines);
              return updatedMedicines;
            });

            console.log(`✅ Successfully synced new medicine. Temp ID: ${medicine.MedicineID}, Real ID: ${realId}`);
          }
        }
        // Nếu là thuốc cần cập nhật
        else if (medicine._pendingSync && !medicine._isTemp) {
          console.log('🔄 Updating existing medicine on server');
          await medicineApi.parent.updateMedicine({
            ...syncData,
            MedicineID: medicine.MedicineID
          });

          // Xóa trạng thái đồng bộ
          setMedicines(prevMedicines => {
            const updatedMedicines = prevMedicines.map(med => {
              if (med.MedicineID === medicine.MedicineID) {
                return { ...med, _pendingSync: false };
              }
              return med;
            });
            saveMedicinesToStorage(updatedMedicines);
            return updatedMedicines;
          });

          console.log(`✅ Successfully synced medicine update: ${medicine.MedicineID}`);
        }
      } catch (error) {
        console.error(`❌ Failed to sync medicine ${medicine.MedicineID}:`, error);
      }
    }

    // 🔥 SAU KHI ĐỒNG BỘ XONG: Kiểm tra xem có còn thuốc nào không
    // Nếu không còn thuốc nào (database trống hoàn toàn) thì xóa lịch sử
    setTimeout(() => {
      if (medicines.length === 0) {
        console.log('🗑️ Sau khi đồng bộ: Không còn thuốc nào, xóa lịch sử thuốc');
        clearMedicineHistory('Sau khi đồng bộ - database trống');
      }
    }, 1000); // Đợi 1 giây để state được cập nhật
  };

  // ==================== HISTORY MANAGEMENT ====================

  // 🔥 Helper function để xóa lịch sử thuốc khi database trống hoàn toàn
  const clearMedicineHistory = (reason = 'Database trống hoàn toàn') => {
    try {
      console.log(`🗑️ Xóa lịch sử thuốc - Lý do: ${reason}`);
      localStorage.removeItem(MEDICINE_HISTORY_KEY);
      console.log('✅ Đã xóa lịch sử thuốc thành công');
    } catch (error) {
      console.error('❌ Lỗi khi xóa lịch sử thuốc:', error);
    }
  };

  // ==================== HISTORY FUNCTIONS ====================

  const hasHistory = (record) => {
    const history = getMedicineHistory(record.MedicineID);
    return history && history.length > 0;
  };

  const getMedicineHistory = (medicineId) => {
    try {
      const historyData = localStorage.getItem(MEDICINE_HISTORY_KEY);
      if (historyData) {
        const allHistory = JSON.parse(historyData);
        return allHistory[medicineId] || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading medicine history:', error);
      return [];
    }
  };

  const saveMedicineHistory = (medicineId, historyEntry) => {
    try {
      const currentHistory = localStorage.getItem(MEDICINE_HISTORY_KEY);
      let allHistory = currentHistory ? JSON.parse(currentHistory) : {};

      if (!allHistory[medicineId]) {
        allHistory[medicineId] = [];
      }

      // Thêm entry mới vào đầu array (newest first)
      allHistory[medicineId].unshift({
        ...historyEntry,
        timestamp: new Date().toISOString(),
        id: Date.now() // unique ID cho mỗi history entry
      });

      // Giới hạn tối đa 10 entries per medicine
      if (allHistory[medicineId].length > 10) {
        allHistory[medicineId] = allHistory[medicineId].slice(0, 10);
      }

      localStorage.setItem(MEDICINE_HISTORY_KEY, JSON.stringify(allHistory));
      console.log('💾 Saved history for medicine:', medicineId);
    } catch (error) {
      console.error('❌ Error saving medicine history:', error);
    }
  };

  const getChangedFields = (oldData, newData) => {
    const changes = [];
    const fieldsToCheck = ['MedicineName', 'Quantity', 'Dosage', 'Instructions', 'Notes'];

    fieldsToCheck.forEach(field => {
      const oldValue = oldData[field] || '';
      const newValue = newData[field] || '';

      if (oldValue !== newValue) {
        changes.push({
          field: field,
          from: oldValue,
          to: newValue
        });
      }
    });

    return changes;
  };

  const getFieldDisplayName = (fieldName) => {
    const fieldNames = {
      'MedicineName': 'Tên thuốc',
      'Quantity': 'Số lượng',
      'Dosage': 'Liều lượng',
      'Instructions': 'Hướng dẫn sử dụng',
      'Notes': 'Ghi chú',
      'Status': 'Trạng thái'
    };
    return fieldNames[fieldName] || fieldName;
  };

  const handleViewHistory = (record) => {
    console.log('📜 Viewing history for medicine:', record.MedicineID);

    const history = getMedicineHistory(record.MedicineID);
    setViewingMedicineHistory(record);
    setMedicineHistory(history);
    setIsHistoryModalVisible(true);
  };

  // ==================== API FUNCTIONS ====================

  const fetchStudents = async (isAutoRefresh = false) => {
    // 🚫 Ngăn việc gọi nhiều lần cùng lúc
    if (studentsLoading || fetchingStudents) {
      console.log('⚠️ fetchStudents đã đang chạy, bỏ qua...');
      return;
    }

    // 🚫 Ngăn việc gọi lại khi đã initialized (trừ khi force refresh)
    if (studentsInitialized && !isAutoRefresh) {
      console.log('⚠️ Students đã được initialized, bỏ qua...');
      return;
    }

    try {
      setStudentsLoading(true);
      setFetchingStudents(true); // 🆕 Đánh dấu đang fetch
      console.log('🔄 Đang lấy danh sách học sinh của phụ huynh...');

      // Sử dụng API từ studentApi 
      const response = await studentApi.parent.getMyChildren();
      console.log('✅ API getMyChildren response:', response);

      const studentsData = response.data || [];

      if (Array.isArray(studentsData) && studentsData.length > 0) {
        const processedStudents = studentsData.map(student => {
          // Xử lý dữ liệu học sinh dựa trên cấu trúc thực tế từ API
          // ✅ Ưu tiên trường "class" mới từ backend
          return {
            StudentID: student.studentID || student.StudentID || student.id,
            StudentName: student.studentName || student.StudentName || student.name || 'Học sinh',
            StudentCode: student.studentID || student.StudentID || student.studentCode || student.id,
            Class: student.class || student.className || student.ClassName || student.grade || student.classRoom || student.class_name || 'Chưa phân lớp',
            Age: student.age || (student.birthday ? new Date().getFullYear() - new Date(student.birthday).getFullYear() : 0),
            Sex: student.sex || student.gender || 'Chưa xác định',
            Birthday: student.birthday || student.dob || null,
            ParentName: student.parentName || null
          };
        });

        console.log('📋 Danh sách học sinh đã xử lý:', processedStudents);
        setStudents(processedStudents);

        // Tự động chọn học sinh đầu tiên nếu chưa chọn
        if (processedStudents.length > 0 && !selectedStudentId) {
          console.log('🔍 Tự động chọn học sinh đầu tiên:', processedStudents[0].StudentID);
          setSelectedStudentId(processedStudents[0].StudentID);
        }

        // Chỉ hiển thị message khi thực sự cần (không phải call từ interval/auto-refresh)
        console.log('🔍 Debug fetchStudents message:', { isAutoRefresh, studentsLength: processedStudents.length });

        // ❌ TẠM THỜI TẮT MESSAGE ĐỂ NGĂN SPAM
        // if (!isAutoRefresh) {
        //   message.success(`Đã tải ${processedStudents.length} học sinh`);
        // }

        // ✅ CHỈ HIỂN THỊ MESSAGE LẦN ĐẦU TIÊN
        if (!studentsInitialized && !isAutoRefresh) {
          console.log(`✅ Đã tải ${processedStudents.length} học sinh`);
        }
      } else {
        console.warn('⚠️ Không tìm thấy học sinh nào từ API');
        // Nếu không có dữ liệu từ API, sử dụng dữ liệu mẫu
        createMockStudents();
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách học sinh:', error);
      console.error('❌ Chi tiết lỗi:', error.response?.data);
      console.error('❌ Mã lỗi:', error.response?.status);

      // Sử dụng dữ liệu mẫu nếu có lỗi
      createMockStudents();
    } finally {
      setStudentsLoading(false);
      setFetchingStudents(false); // 🆕 Đánh dấu kết thúc fetch
      setStudentsInitialized(true); // 🆕 Đánh dấu đã hoàn thành việc load students
    }
  };

  const createMockStudents = () => {
    console.log('⚠️ Sử dụng dữ liệu học sinh mẫu');
    const mockStudents = [
      {
        StudentID: 'ST001',
        StudentName: 'Lê Văn Bình',
        Class: 'Lớp 2',
        Age: 8,
        Sex: 'Nam'
      },
      {
        StudentID: 'ST002',
        StudentName: 'Lê Thị Cẩm Ly',
        Class: 'Lớp 4',
        Age: 10,
        Sex: 'Nữ'
      }
    ];

    setStudents(mockStudents);
    setStudentsInitialized(true); // 🆕 Đánh dấu đã hoàn thành việc load students
    setFetchingStudents(false); // 🆕 Đánh dấu kết thúc fetch
    if (mockStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(mockStudents[0].StudentID);
    }

    message.warning('Sử dụng dữ liệu mẫu - Vui lòng kiểm tra kết nối');
  };

  const normalizeStatus = (status) => {
    // Nếu status không tồn tại, trả về giá trị mặc định
    if (!status) return 'Chờ xử lý';

    // Debug - log trạng thái gốc
    console.log('📝 Normalize status - Original:', status);

    // Đưa về chữ thường và bỏ dấu cách thừa để dễ so sánh
    const cleanStatus = status.toString().toLowerCase().trim();

    // Debug - log trạng thái đã làm sạch
    console.log('�� Normalize status - Cleaned:', cleanStatus);

    // Mapping đầy đủ hơn để xử lý các trường hợp khác nhau
    const statusMap = {
      // Các trạng thái tiếng Việt chuẩn
      'chờ xử lý': 'Chờ xử lý',
      'đã xác nhận': 'Đã xác nhận',
      'đã duyệt': 'Đã xác nhận', // ⭐ Đồng bộ "Đã duyệt" từ y tế thành "Đã xác nhận" cho phụ huynh
      'đang thực hiện': 'Đang thực hiện',
      'đã hoàn thành': 'Đã hoàn thành',
      'từ chối': 'Từ chối',
      'chờ xác nhận': 'Chờ xác nhận',

      // Các trạng thái có thể bị mã hóa sai UTF-8
      'cho xu ly': 'Chờ xử lý',
      'cho xac nhan': 'Chờ xác nhận',
      'da xac nhan': 'Đã xác nhận',
      'da duyet': 'Đã xác nhận' // ⭐ Đồng bộ "Đã duyệt" từ y tế thành "Đã xác nhận" cho phụ huynh
      , 'dang thuc hien': 'Đang thực hiện',
      'da hoan thanh': 'Đã hoàn thành',
      'tu choi': 'Từ chối',

      // Các trạng thái mã hóa sai tiềm ẩn từ server
      'ch? x? lý': 'Chờ xử lý',
      'ch? xác nh?n': 'Chờ xác nhận',
      'ðã xác nh?n': 'Đã xác nhận',
      'ðã duy?t': 'Đã xác nhận' // ⭐ Đồng bộ "Đã duyệt" từ y tế thành "Đã xác nhận" cho phụ huynh
      , 'ðang th?c hi?n': 'Đang thực hiện',
      'ðã hoàn thành': 'Đã hoàn thành',
      't? ch?i': 'Từ chối',

      // Các trạng thái viết tắt hoặc sai chính tả
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'approved': 'Đã xác nhận', // ⭐ Đồng bộ các trạng thái từ tiếng Anh
      'in progress': 'Đang thực hiện',
      'completed': 'Đã hoàn thành',
      'rejected': 'Từ chối',
      'waiting': 'Chờ xử lý',
      'processing': 'Đang thực hiện',
      'done': 'Đã hoàn thành',

      // Các giá trị số (nếu có)
      '0': 'Chờ xử lý',
      '1': 'Đã xác nhận',
      '2': 'Đang thực hiện',
      '3': 'Đã hoàn thành',
      '4': 'Từ chối',
    };

    // Thử tìm trong mapping với chuỗi đã được chuẩn hóa
    const result = statusMap[cleanStatus];
    if (result) {
      console.log('📝 Normalize status - Mapped:', result);
      return result;
    }

    // Nếu không tìm được, thử kiểm tra một cách thông minh hơn
    if (cleanStatus.includes('ch') && (cleanStatus.includes('ly') || cleanStatus.includes('xu'))) {
      return 'Chờ xử lý';
    }
    if (cleanStatus.includes('xac') && cleanStatus.includes('nhan')) {
      return cleanStatus.includes('da') ? 'Đã xác nhận' : 'Chờ xác nhận';
    }
    if (cleanStatus.includes('hoan') && cleanStatus.includes('thanh')) {
      return 'Đã hoàn thành';
    }
    if (cleanStatus.includes('tu') && cleanStatus.includes('choi')) {
      return 'Từ chối';
    }
    if (cleanStatus.includes('thuc') && cleanStatus.includes('hien')) {
      return 'Đang thực hiện';
    }
    // ⭐ Kiểm tra "duyệt" -> Đã xác nhận
    if (cleanStatus.includes('duyet') || cleanStatus.includes('duy?t') || cleanStatus.includes('approv')) {
      console.log('📝 Normalize status - Detected approval:', cleanStatus);
      return 'Đã xác nhận';
    }

    // Log trạng thái không thể chuẩn hóa để debug
    console.log('⚠️ Trạng thái không thể chuẩn hóa:', status);

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
        console.log('⚠️ Chưa có danh sách học sinh');

        // Nếu students chưa được initialized, chờ và chỉ dùng localStorage khi offline
        if (!studentsInitialized) {
          console.log('⏳ Students đang được tải, chờ...');
          if (!navigator.onLine) {
            loadPersistedMedicines();
          } else {
            setMedicines([]); // Hiển thị rỗng khi online nhưng chưa có students
          }
          setLoading(false);
          return;
        }

        // Nếu đã initialized nhưng vẫn không có students
        console.log('📁 Students đã tải xong nhưng không có dữ liệu');
        if (!navigator.onLine) {
          console.log('📱 Offline - Sử dụng localStorage');
          loadPersistedMedicines();
        } else {
          console.log('🌐 Online - Hiển thị rỗng vì không có students');
          setMedicines([]);
          saveMedicinesToStorage([]);

          // 🔥 XÓA LỊCH SỬ THUỐC khi không có students (có thể do database trống)
          console.log('🗑️ Xóa lịch sử thuốc vì không có students');
          clearMedicineHistory('Không có students');
        }
        setLoading(false);
        return;
      }

      console.log('📚 Sử dụng API tối ưu: Lấy TẤT CẢ thuốc của parent từ 1 lần gọi API');

      // ✅ OPTIMIZATION: Chỉ gọi 1 lần API thay vì loop cho từng student
      let allMedicines = [];
      try {
        const studentIds = currentStudents.map(student => student.StudentID);
        console.log('🔍 Danh sách ID học sinh:', studentIds);

        if (studentIds.length === 0) {
          console.log('⚠️ Không có học sinh nào để lấy thuốc');
          if (!navigator.onLine) {
            loadPersistedMedicines();
          } else {
            setMedicines([]);
            saveMedicinesToStorage([]);

            // 🔥 XÓA LỊCH SỬ THUỐC khi không có studentIds
            console.log('🗑️ Xóa lịch sử thuốc vì không có studentIds');
            clearMedicineHistory('Không có studentIds');
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
          dataLength: Array.isArray(response?.data) ? response.data.length : 'N/A',
          dataKeys: response?.data ? Object.keys(response.data) : [],
          sampleData: response?.data && Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : response?.data
        });

        if (response?.data) {
          if (Array.isArray(response.data)) {
            allMedicines = response.data;
            console.log(`📦 Dữ liệu là mảng trực tiếp: ${allMedicines.length} thuốc tổng`);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            allMedicines = response.data.data;
            console.log(`📦 Dữ liệu nằm trong trường data: ${allMedicines.length} thuốc tổng`);
          } else if (response.data.medicineID || response.data.MedicineID) {
            allMedicines = [response.data];
            console.log('📦 Dữ liệu là một đối tượng thuốc đơn lẻ');
          } else {
            console.log('⚠️ Dữ liệu có cấu trúc không xác định:', response.data);
            allMedicines = [];
          }

          // 🔍 Filter medicines theo studentIds của parent (đảm bảo chỉ hiển thị thuốc của con)
          const filteredMedicines = allMedicines.filter(med => {
            const medicineStudentId = med.studentID || med.StudentID || med.student_id;
            const isForParentChild = studentIds.includes(medicineStudentId);
            if (!isForParentChild && medicineStudentId) {
              console.log(`🚫 Loại bỏ thuốc không thuộc con của parent: ${med.medicineID || med.MedicineID} (StudentID: ${medicineStudentId})`);
            }
            return isForParentChild;
          });

          allMedicines = filteredMedicines;
          console.log(`✅ Sau khi filter: ${allMedicines.length} thuốc thuộc về con của parent`);

          // Kiểm tra chi tiết trạng thái của các thuốc
          if (allMedicines.length > 0) {
            console.log('📋 Chi tiết các thuốc nhận được:');
            allMedicines.forEach((med, idx) => {
              console.log(`Thuốc #${idx + 1}:`, {
                id: med.medicineID || med.MedicineID,
                name: med.medicineName || med.MedicineName,
                status_original: med.status || med.Status,
                status_normalized: normalizeStatus(med.status || med.Status || 'Chờ xử lý'),
                studentId: med.studentID || med.StudentID || med.student_id
              });
            });
          }
        } else {
          console.log('⚠️ Không nhận được dữ liệu từ API');
          allMedicines = [];
        }

        console.log('📊 Tổng số thuốc nhận được:', allMedicines.length);

        // Debug - kiểm tra xem có thuốc đã duyệt hay không
        const approvedMeds = allMedicines.filter(m =>
          m.status === 'Đã xác nhận' ||
          m.status === 'Đã duyệt' ||
          m.Status === 'Đã xác nhận' ||
          m.Status === 'Đã duyệt'
        );
        console.log('📊 Số lượng thuốc đã được duyệt:', approvedMeds.length);
        if (approvedMeds.length > 0) {
          console.log('📊 Chi tiết thuốc đã duyệt:', approvedMeds.map(med => ({
            id: med.medicineID || med.MedicineID,
            name: med.medicineName || med.MedicineName,
            status_original: med.status || med.Status
          })));
        }

      } catch (error) {
        console.error('❌ Lỗi khi lấy dữ liệu từ API:', error);

        // ✅ CHỈ fallback về localStorage khi OFFLINE
        if (!navigator.onLine) {
          console.log('📱 Offline - Sử dụng localStorage');
          loadPersistedMedicines();
        } else {
          console.log('🌐 Online nhưng có lỗi API - Hiển thị rỗng thay vì localStorage cũ');

          // Chỉ giữ lại thuốc pending
          const pendingMedicines = medicines.filter(m => m._pendingSync === true || m._isTemp === true);
          setMedicines(pendingMedicines);
          saveMedicinesToStorage(pendingMedicines);

          message.error('Lỗi kết nối API - Chỉ hiển thị thuốc chưa đồng bộ');
        }

        setLoading(false);
        return;
      }

      // ✅ QUAN TRỌNG: Nếu API trả về rỗng, có nghĩa database đã bị xóa
      // KHÔNG ĐƯỢC fallback về localStorage trong trường hợp này
      if (allMedicines.length === 0) {
        console.log('🗑️ API trả về rỗng - Database đã bị xóa hoặc không có thuốc');

        // Chỉ giữ lại các thuốc đang chờ đồng bộ (nếu có)
        const pendingMedicines = medicines.filter(m => m._pendingSync === true || m._isTemp === true);

        if (pendingMedicines.length === 0) {
          console.log('🗑️ Không có thuốc pending, xóa toàn bộ UI và lịch sử');
          console.log('✅ Dữ liệu đã được đồng bộ với database (trống)');
          setMedicines([]);
          saveMedicinesToStorage([]);

          // 🔥 XÓA LỊCH SỬ THUỐC khi database trống hoàn toàn
          console.log('🗑️ Xóa lịch sử thuốc vì database đã trống hoàn toàn');
          clearMedicineHistory('Database trống hoàn toàn');
        } else {
          console.log(`⏳ Chỉ giữ ${pendingMedicines.length} thuốc pending chưa đồng bộ`);
          setMedicines(pendingMedicines);
          saveMedicinesToStorage(pendingMedicines);
          message.warning(`Database trống, chỉ còn ${pendingMedicines.length} thuốc chưa đồng bộ`);
        }

        setLoading(false);
        return;
      }

      // Chuẩn hóa dữ liệu từ server
      const processedServerMedicines = allMedicines.map(medicine => ({
        MedicineID: medicine.medicineID || medicine.MedicineID,
        MedicineName: medicine.medicineName || medicine.MedicineName,
        Quantity: medicine.quantity || medicine.Quantity,
        Dosage: medicine.dosage || medicine.Dosage,
        Instructions: medicine.instructions || medicine.Instructions || '',
        Notes: medicine.notes || medicine.Notes || '',
        Status: normalizeStatus(medicine.status || medicine.Status || 'Chờ xử lý'),
        SentDate: medicine.sentDate || medicine.SentDate || medicine.createdAt,
        StudentID: medicine.studentID || medicine.StudentID || medicine.student_id,
        NurseID: medicine.nurseID || medicine.NurseID || null,
        ParentID: medicine.parentID || medicine.ParentID || null,
        Images: medicine.image ? [medicine.image] : medicine.images || medicine.Images || [],
        _fromServer: true,
        _serverFetchedAt: new Date().toISOString()
      }));

      // Kiểm tra trạng thái sau khi chuẩn hóa
      const statusCounts = {};
      processedServerMedicines.forEach(med => {
        statusCounts[med.Status] = (statusCounts[med.Status] || 0) + 1;
      });
      console.log('📊 Phân bố trạng thái sau khi chuẩn hóa:', statusCounts);

      // Chỉ giữ lại các thuốc đang chờ đồng bộ (nếu có)
      const pendingMedicines = medicines.filter(m => m._pendingSync === true || m._isTemp === true);

      // ✅ Kết hợp data từ server và pending medicines
      const combinedMedicines = [
        ...processedServerMedicines,
        ...pendingMedicines.filter(m => !processedServerMedicines.some(s => s.MedicineID === m.MedicineID))
      ];

      setMedicines(combinedMedicines);
      saveMedicinesToStorage(combinedMedicines);
      console.log(`✅ Đã tải ${processedServerMedicines.length} yêu cầu thuốc từ server`);
    } catch (error) {
      console.error('❌ Lỗi không xác định:', error);

      // ✅ CHỈ fallback về localStorage khi OFFLINE
      if (!navigator.onLine) {
        console.log('📱 Offline - Sử dụng localStorage');
        message.warning('Không có kết nối internet - Hiển thị dữ liệu cục bộ');
        loadPersistedMedicines();
      } else {
        console.log('🌐 Online nhưng có lỗi - Hiển thị rỗng thay vì localStorage cũ');

        // Chỉ giữ lại thuốc pending
        const pendingMedicines = medicines.filter(m => m._pendingSync === true || m._isTemp === true);
        setMedicines(pendingMedicines);
        saveMedicinesToStorage(pendingMedicines);

        message.error('Lỗi không xác định - Chỉ hiển thị thuốc chưa đồng bộ');
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLER FUNCTIONS ====================

  const getStudentName = (studentId) => {
    const student = students.find(s => s.StudentID === studentId);
    return student ? student.StudentName : studentId;
  };

  const getStudentClass = (studentId) => {
    const student = students.find(s => s.StudentID === studentId);
    return student ? (student.Class || 'Chưa phân lớp') : 'Chưa phân lớp';
  };

  const getCurrentStudentMedicines = () => {
    console.log('===== CHẠY HÀM LỌC THUỐC =====');
    console.log('Dữ liệu ban đầu:', {
      tổngSốThuốc: medicines.length,
      họcSinhĐangChọn: selectedStudentId,
      trạngTháiLọc: statusFilter
    });

    // In ra tất cả ID thuốc đang có trong state để debug
    console.log('Danh sách ID thuốc ban đầu:', medicines.map(m =>
      `${m.MedicineID} (${m.StudentID}, ${m.Status})`
    ));

    // Kiểm tra cụ thể các thuốc có trạng thái "Đã duyệt" hoặc "Đã xác nhận"
    const approvedMeds = medicines.filter(m =>
      normalizeStatus(m.Status) === 'Đã xác nhận'
    );
    console.log('🔍 Thuốc đã được duyệt trong medicines:', approvedMeds.map(m =>
      `${m.MedicineID} (${m.StudentID}, ${m.Status})`
    ));

    let filteredMedicines = medicines;

    // Filter by student
    if (selectedStudentId) {
      console.log(`Đang lọc theo học sinh: ${selectedStudentId}`);

      // Sử dụng so sánh không phân biệt chữ hoa/thường để tránh lỗi case sensitivity
      filteredMedicines = filteredMedicines.filter(m => {
        const match = m.StudentID && selectedStudentId &&
          m.StudentID.toString().toLowerCase() === selectedStudentId.toString().toLowerCase();

        if (!match && m.StudentID) {
          console.log(`❓ Thuốc không khớp: ${m.MedicineID}, StudentID: ${m.StudentID} vs ${selectedStudentId}`);
        }

        return match;
      });

      console.log(`Sau khi lọc theo học sinh: ${filteredMedicines.length} thuốc còn lại`);
      console.log('ID thuốc sau khi lọc học sinh:', filteredMedicines.map(m => m.MedicineID));
    }

    // Filter by status
    if (statusFilter) {
      console.log(`Đang lọc theo trạng thái: ${statusFilter}`);

      // Kiểm tra chuẩn hóa trạng thái
      filteredMedicines = filteredMedicines.filter(m => {
        const normalizedMedicineStatus = normalizeStatus(m.Status);
        const normalizedFilterStatus = normalizeStatus(statusFilter);
        const matches = normalizedMedicineStatus === normalizedFilterStatus;

        console.log(`Kiểm tra trạng thái của ${m.MedicineID}: ${m.Status} -> ${normalizedMedicineStatus} vs ${normalizedFilterStatus}: ${matches}`);

        return matches;
      });

      console.log(`Sau khi lọc theo trạng thái: ${filteredMedicines.length} thuốc còn lại`);
      console.log('ID thuốc sau khi lọc trạng thái:', filteredMedicines.map(m => m.MedicineID));
    }

    console.log('===== KẾT QUẢ LỌC =====');
    console.log(`Tổng số thuốc sau khi lọc: ${filteredMedicines.length}`);

    return filteredMedicines;
  };

  const handleCreate = () => {
    if (!selectedStudentId) {
      message.warning('Vui lòng chọn học sinh trước');
      return;
    }

    setEditingMedicine(null);
    setIsModalVisible(true);
    form.resetFields();
    setFileList([]);
  };

  const handleEdit = (record) => {
    console.log('✏️ EDIT clicked for medicine:', record.MedicineID);

    setEditingMedicine(record);

    form.setFieldsValue({
      MedicineName: record.MedicineName,
      Quantity: record.Quantity,
      Dosage: record.Dosage,
      Instructions: record.Instructions || '',
      Notes: record.Notes || ''
    });

    setFileList([]);
    setIsModalVisible(true);

    console.log('✅ Edit form populated with data:', {
      name: record.MedicineName,
      quantity: record.Quantity,
      dosage: record.Dosage
    });
  };

  const handleView = (record) => {
    setViewingMedicine(record);
    setIsViewModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (!values.MedicineName?.trim() || !values.Quantity?.trim() || !values.Dosage?.trim()) {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      if (!selectedStudentId) {
        message.error('Vui lòng chọn học sinh');
        return;
      }

      // Xử lý hình ảnh từ fileList
      const images = fileList.map(file => file.originFileObj).filter(Boolean);

      // Chuẩn bị dữ liệu chung
      const medicineData = {
        MedicineName: values.MedicineName.trim(),
        Quantity: values.Quantity.trim(),
        Dosage: values.Dosage.trim(),
        Instructions: values.Instructions?.trim() || '',
        Notes: values.Notes?.trim() || '',
        StudentID: selectedStudentId,
        Images: images
      };

      // Xử lý trường hợp cập nhật
      if (editingMedicine) {
        console.log('Đang cập nhật thuốc:', editingMedicine.MedicineID);

        // Lưu lịch sử thay đổi
        const historyEntry = {
          action: 'UPDATE',
          previousData: {
            MedicineName: editingMedicine.MedicineName,
            Quantity: editingMedicine.Quantity,
            Dosage: editingMedicine.Dosage,
            Instructions: editingMedicine.Instructions,
            Notes: editingMedicine.Notes
          },
          newData: {
            MedicineName: medicineData.MedicineName,
            Quantity: medicineData.Quantity,
            Dosage: medicineData.Dosage,
            Instructions: medicineData.Instructions,
            Notes: medicineData.Notes
          },
          changedFields: getChangedFields(editingMedicine, medicineData),
          updatedBy: 'Parent'
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
          Images: images.length > 0
            ? images.map(file => URL.createObjectURL(file))
            : editingMedicine.Images || [],
          // ✅ Đánh dấu cần đồng bộ khi update
          _pendingSync: true,
          _lastUpdateAttempt: new Date().toISOString()
        };

        // Cập nhật state local trước để giao diện phản hồi nhanh
        setMedicines(prevMedicines => {
          const updatedMedicines = prevMedicines.map(med =>
            med.MedicineID === editingMedicine.MedicineID ? updatedMedicine : med
          );
          saveMedicinesToStorage(updatedMedicines);
          return updatedMedicines;
        });

        // Hiển thị thông báo đang cập nhật
        message.loading('Đang cập nhật thuốc...', 1);

        // Gọi API để cập nhật trên server
        try {
          const apiData = {
            MedicineID: editingMedicine.MedicineID,
            ...medicineData
          };

          console.log('Gửi dữ liệu cập nhật lên server:', apiData);
          console.log('Chi tiết API Data:', {
            MedicineID: apiData.MedicineID,
            MedicineName: apiData.MedicineName,
            Quantity: apiData.Quantity,
            Dosage: apiData.Dosage,
            Instructions: apiData.Instructions,
            Notes: apiData.Notes,
            Images: apiData.Images,
            ImagesLength: apiData.Images?.length || 0
          });

          const updateResponse = await medicineApi.parent.updateMedicine(apiData);
          console.log('Kết quả cập nhật từ server:', updateResponse);

          // ✅ XÓA FLAG _pendingSync KHI THÀNH CÔNG
          setMedicines(prevMedicines => {
            const updatedMedicines = prevMedicines.map(med => {
              if (med.MedicineID === editingMedicine.MedicineID) {
                return { ...med, _pendingSync: false };
              }
              return med;
            });
            saveMedicinesToStorage(updatedMedicines);
            return updatedMedicines;
          });

          message.success('Cập nhật thuốc thành công!');

          // Force refresh để lấy dữ liệu mới nhất từ server
          console.log('🔄 Force refresh sau khi cập nhật thuốc thành công');
          setTimeout(() => {
            fetchMedicinesFromServer();
          }, 500);
        } catch (updateError) {
          console.error('❌ Lỗi khi cập nhật thuốc trên server:', updateError);
          console.error('❌ Chi tiết lỗi:', {
            message: updateError.message,
            response: updateError.response?.data,
            status: updateError.response?.status,
            statusText: updateError.response?.statusText
          });

          // Kiểm tra loại lỗi để đưa ra thông báo phù hợp
          if (updateError.response?.status === 401) {
            message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          } else if (updateError.response?.status === 403) {
            message.error('Bạn không có quyền cập nhật thuốc này.');
          } else if (updateError.response?.status === 404) {
            message.error('Không tìm thấy thuốc cần cập nhật.');
          } else if (updateError.response?.status >= 500) {
            message.error('Lỗi server. Vui lòng thử lại sau.');
          } else if (!navigator.onLine) {
            message.warning('Không có kết nối internet. Thay đổi sẽ được đồng bộ khi có kết nối.');
          } else {
            message.warning(`Đã lưu cục bộ, thay đổi sẽ được đồng bộ khi có kết nối. (Lỗi: ${updateError.message})`);
          }

          // ✅ GIỮ NGUYÊN _pendingSync = true để đồng bộ sau
        }
      }
      // Xử lý trường hợp tạo mới
      else {
        console.log('Đang tạo thuốc mới');

        // Tạo ID tạm thời duy nhất cho thuốc mới
        const tempId = `MED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Tạo đối tượng thuốc mới với ID tạm thời và trạng thái "Chờ xử lý"
        const newMedicine = {
          MedicineID: tempId,
          ...medicineData,
          Status: 'Chờ xử lý', // Trạng thái mặc định cho yêu cầu mới
          Images: images.map(file => URL.createObjectURL(file)),
          SentDate: new Date().toISOString(),
          NurseID: null,
          ParentID: null,
          _isTemp: true, // Đánh dấu là thuốc tạm thời chưa đồng bộ
          _pendingSync: true, // Đánh dấu cần đồng bộ
          _createdAt: new Date().toISOString() // Thời gian tạo offline
        };

        // Thêm vào state local trước để UI phản hồi ngay lập tức
        setMedicines(prevMedicines => {
          const updatedMedicines = [...prevMedicines, newMedicine];
          saveMedicinesToStorage(updatedMedicines);
          return updatedMedicines;
        });

        message.loading('Đang tạo yêu cầu thuốc...', 1);

        // Gọi API để tạo trên server
        try {
          console.log('Gửi dữ liệu tạo thuốc lên server:', medicineData);
          const createResponse = await medicineApi.parent.createMedicine(medicineData);
          console.log('Kết quả tạo thuốc từ server:', createResponse);

          if (createResponse?.data?.medicineID || createResponse?.data?.MedicineID) {
            const realId = createResponse.data.medicineID || createResponse.data.MedicineID;
            const serverStatus = createResponse.data.status || createResponse.data.Status || 'Chờ xử lý';
            const serverDate = createResponse.data.sentDate || createResponse.data.SentDate || newMedicine.SentDate;

            console.log('Nhận được ID thuốc từ server:', realId);

            // Cập nhật ID thật từ server và xóa các flag tạm thời
            setMedicines(prevMedicines => {
              const updatedMedicines = prevMedicines.map(med => {
                if (med.MedicineID === tempId) {
                  return {
                    ...med,
                    MedicineID: realId,
                    Status: normalizeStatus(serverStatus),
                    SentDate: serverDate,
                    _isTemp: false,
                    _pendingSync: false
                  };
                }
                return med;
              });
              saveMedicinesToStorage(updatedMedicines);
              return updatedMedicines;
            });

            message.success('Đã lưu yêu cầu thuốc trên server!');

            // Force refresh để lấy dữ liệu mới nhất từ server
            console.log('🔄 Force refresh sau khi tạo thuốc thành công');
            setTimeout(() => {
              fetchMedicinesFromServer();
            }, 500);
          }
        } catch (createError) {
          console.error('Lỗi khi tạo thuốc trên server:', createError);
          message.warning('Đã lưu cục bộ, yêu cầu sẽ tự động đồng bộ khi có kết nối internet.');
        }
      }

      // Đóng modal và reset form
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      setEditingMedicine(null);
    } catch (error) {
      console.error('Lỗi khi xử lý form:', error);
      message.error(`Có lỗi xảy ra: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const getStatusColor = (status) => {
    const normalizedStatus = normalizeStatus(status);
    const colors = {
      'Chờ xử lý': 'orange',
      'Đã xác nhận': 'green',
      'Đang thực hiện': 'blue',
      'Đã hoàn thành': 'green',
      'Từ chối': 'red',
      'Chờ xác nhận': 'blue'
    };
    return colors[normalizedStatus] || 'default';
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = normalizeStatus(status);
    const icons = {
      'Chờ xử lý': <ClockCircleOutlined />,
      'Đã xác nhận': <CheckCircleOutlined />,
      'Đang thực hiện': <SyncOutlined />,
      'Đã hoàn thành': <CheckCircleOutlined />,
      'Từ chối': <ExclamationCircleOutlined />,
      'Chờ xác nhận': <ClockCircleOutlined />
    };
    return icons[normalizedStatus] || <ClockCircleOutlined />;
  };

  const canEdit = (record) => {
    const normalizedStatus = normalizeStatus(record.Status);

    // Chỉ cho phép edit khi thuốc đang ở trạng thái chờ xử lý hoặc chờ xác nhận
    const canEditStatus = normalizedStatus === 'Chờ xử lý' || normalizedStatus === 'Chờ xác nhận';

    // ✅ BACKEND LOGIC: Cho phép update tất cả các medicine chưa được y tế xử lý (NurseID == null)
    const isUnprocessedByNurse = !record.NurseID; // NurseID == null

    console.log('🔍 Can edit check:', {
      medicineId: record.MedicineID,
      originalStatus: record.Status,
      normalizedStatus: normalizedStatus,
      canEditStatus: canEditStatus,
      isUnprocessedByNurse: isUnprocessedByNurse,
      canEdit: canEditStatus && isUnprocessedByNurse
    });

    return canEditStatus && isUnprocessedByNurse;
  };

  // Get statistics
  const currentStudentMedicines = getCurrentStudentMedicines();
  const totalMedicines = currentStudentMedicines.length;
  const pendingCount = currentStudentMedicines.filter(m => normalizeStatus(m.Status) === 'Chờ xử lý').length;
  const approvedCount = currentStudentMedicines.filter(m => normalizeStatus(m.Status) === 'Đã xác nhận').length;
  const inUseCount = currentStudentMedicines.filter(m => normalizeStatus(m.Status) === 'Đang thực hiện').length;
  const completedCount = currentStudentMedicines.filter(m => normalizeStatus(m.Status) === 'Đã hoàn thành').length;
  const rejectedCount = currentStudentMedicines.filter(m => normalizeStatus(m.Status) === 'Từ chối').length;

  // ==================== TABLE COLUMNS ====================

  const columns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'MedicineID',
      key: 'MedicineID',
      width: 100, // ✅ Giảm từ 120 xuống 100
      fixed: 'left', // ✅ Fix cột đầu
      render: (text, record) => (
        <div>
          <Text strong className="text-blue-600 text-xs">{text}</Text>
        </div>
      ),
    },
    {
      title: 'Học sinh',
      dataIndex: 'StudentID',
      key: 'StudentID',
      width: 150, // ✅ Giảm từ 200 xuống 150
      render: (studentId) => {
        const student = students.find(s => s.StudentID === studentId);
        return (
          <div>
            <div className="font-medium text-xs text-blue-500 ">{student?.StudentName || 'N/A'}</div>
            <div className="text-xs text-gray-500">
              {getStudentClass(studentId)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Thuốc & Liều dùng',
      dataIndex: 'MedicineName',
      key: 'MedicineName',
      width: 200, // ✅ Giảm từ 250 xuống 200
      render: (text, record) => (
        <div>
          <div className="font-medium text-purple-700 text-xs">{text}</div>
          <div className="text-xs text-gray-600">
            <span className="bg-blue-50 text-gray-500 px-1 py-0.5 rounded text-xs mr-1">
              {record.Quantity} -
            </span>
            <span className="text-gray-500 text-xs">
              {record.Dosage}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'Status',
      key: 'Status',
      width: 110, // ✅ Giảm từ 120 xuống 110
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
      title: 'Ngày gửi',
      dataIndex: 'SentDate',
      key: 'SentDate',
      width: 100, // ✅ Giảm từ 120 xuống 100
      render: (date) => (
        <div className="text-center">
          <div className="text-xs font-medium" style={{ display: "flex" }}>
            {date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa có'}
          </div>
          <div className="text-xs text-gray-500" style={{ display: "flex" }}>
            {date ? new Date(date).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit'
            }) : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120, // ✅ Giảm từ 140 xuống 120
      fixed: 'right', // ✅ Fix cột cuối
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
            {!canEdit(record) && (normalizeStatus(record.Status) === 'Chờ xử lý' || normalizeStatus(record.Status) === 'Chờ xác nhận') && (
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
    console.log('🌐 App is now ONLINE');
    message.success('Kết nối internet đã được khôi phục');

    // Tìm và đồng bộ các thuốc đang chờ
    const pendingSyncMedicines = medicines.filter(m => m._pendingSync === true || m._isTemp === true);
    if (pendingSyncMedicines.length > 0) {
      console.log('🔄 Found pending medicines after reconnect:', pendingSyncMedicines.length);
      message.info(`Đang đồng bộ ${pendingSyncMedicines.length} yêu cầu thuốc`);
      syncPendingMedicines(pendingSyncMedicines);
    }

    // Tải lại dữ liệu mới từ server
    fetchMedicinesFromServer();
  };

  // Xử lý khi mất kết nối internet
  const handleOfflineStatus = () => {
    console.log('📵 App is now OFFLINE');
    message.warning('Mất kết nối internet - Dữ liệu sẽ được lưu cục bộ và đồng bộ khi có kết nối');
  };

  // Student change handler
  useEffect(() => {
    if (selectedStudentId) {
      console.log('🔄 Học sinh đã thay đổi:', selectedStudentId);
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

  // Tự động fetch medicines khi danh sách students thay đổi
  // ❌ REMOVE: Loại bỏ useEffect này để tránh duplicate calls
  // useEffect(() => {
  //   if (students.length > 0 && navigator.onLine) {
  //     console.log('📚 Danh sách học sinh đã có, tự động fetch medicines');
  //     fetchMedicinesFromServer();
  //   }
  // }, [students.length]);

  // 🆕 Theo dõi khi students đã được initialized để fetch medicines
  useEffect(() => {
    if (studentsInitialized && students.length > 0) {
      console.log('✅ Students đã initialized, bắt đầu fetch medicines từ server');
      fetchMedicinesFromServer();
    }
  }, [studentsInitialized]);

  // Hàm lấy thuốc của parent (không cần studentId nữa)
  const fetchMedicinesByParentId = async () => {
    if (!navigator.onLine) return;

    try {
      console.log(`👨‍👩‍👧‍👦 Đang lấy TẤT CẢ thuốc của parent...`);
      const response = await medicineApi.parent.getMedicinesByParentId();

      console.log('✅ API getMedicinesByParentId response:', response);

      // Debug chi tiết cấu trúc dữ liệu
      console.log('✅ API response.data:', JSON.stringify(response.data, null, 2));

      if (response?.data) {
        let allMedicines = [];

        if (Array.isArray(response.data)) {
          allMedicines = response.data;
          console.log('🔍 Dữ liệu là mảng trực tiếp:', allMedicines.length);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          allMedicines = response.data.data;
          console.log('🔍 Dữ liệu nằm trong trường data:', allMedicines.length);
        } else if (response.data.medicineID || response.data.MedicineID) {
          allMedicines = [response.data];
          console.log('🔍 Dữ liệu là một đối tượng thuốc đơn lẻ');
        } else {
          // Xử lý trường hợp JSON không đúng định dạng mong đợi
          console.log('⚠️ Dữ liệu có cấu trúc không xác định:', response.data);
          try {
            // Thử kiểm tra nếu response là string JSON
            if (typeof response.data === 'string') {
              const parsedData = JSON.parse(response.data);
              console.log('🔄 Đã phân tích dữ liệu string JSON:', parsedData);

              if (Array.isArray(parsedData)) {
                allMedicines = parsedData;
              } else if (parsedData.data && Array.isArray(parsedData.data)) {
                allMedicines = parsedData.data;
              }
            }
            // Kiểm tra nếu có trường khác chứa dữ liệu
            else {
              const possibleFields = ['medicines', 'items', 'results', 'records', 'list'];
              for (const field of possibleFields) {
                if (response.data[field] && Array.isArray(response.data[field])) {
                  console.log(`🔍 Tìm thấy dữ liệu trong trường '${field}'`);
                  allMedicines = response.data[field];
                  break;
                }
              }
            }
          } catch (e) {
            console.error('❌ Lỗi khi xử lý dữ liệu:', e);
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
              status_normalized: normalizeStatus(med.status || med.Status || 'Chờ xử lý'),
              studentId: med.studentID || med.StudentID || med.student_id
            });
          });

          // Debug - kiểm tra xem có thuốc đã duyệt hay không
          const approvedMeds = allMedicines.filter(m => {
            const status = (m.status || m.Status || '').toLowerCase();
            return status.includes('duyệt') || status.includes('xác nhận') ||
              status.includes('approved') || status.includes('confirmed');
          });

          console.log('📊 Số lượng thuốc đã được duyệt của parent:', approvedMeds.length);
          if (approvedMeds.length > 0) {
            console.log('📊 Chi tiết thuốc đã duyệt:', approvedMeds.map(med => ({
              id: med.medicineID || med.MedicineID,
              name: med.medicineName || med.MedicineName,
              status_original: med.status || med.Status
            })));
          }

          // Chuẩn hóa dữ liệu từ server
          const processedMedicines = allMedicines.map(medicine => ({
            MedicineID: medicine.medicineID || medicine.MedicineID,
            MedicineName: medicine.medicineName || medicine.MedicineName,
            Quantity: medicine.quantity || medicine.Quantity,
            Dosage: medicine.dosage || medicine.Dosage,
            Instructions: medicine.instructions || medicine.Instructions || '',
            Notes: medicine.notes || medicine.Notes || '',
            Status: normalizeStatus(medicine.status || medicine.Status || 'Chờ xử lý'),
            SentDate: medicine.sentDate || medicine.SentDate || medicine.createdAt,
            StudentID: medicine.studentID || medicine.StudentID || medicine.student_id,
            NurseID: medicine.nurseID || medicine.NurseID || null,
            ParentID: medicine.parentID || medicine.ParentID || null,
            Images: medicine.image ? [medicine.image] : medicine.images || medicine.Images || [],
            _fromServer: true,
            _serverFetchedAt: new Date().toISOString()
          }));

          // Kiểm tra trạng thái sau khi chuẩn hóa
          const statusCounts = {};
          processedMedicines.forEach(med => {
            statusCounts[med.Status] = (statusCounts[med.Status] || 0) + 1;
          });
          console.log('📊 Phân bố trạng thái sau khi chuẩn hóa:', statusCounts);

          // Cập nhật medicines trong state
          setMedicines(prevMedicines => {
            // Lấy danh sách ID thuốc mới từ server
            const newMedicineIds = processedMedicines.map(m => m.MedicineID);

            // Giữ lại thuốc đang chờ đồng bộ (pending)
            const pendingMedicines = prevMedicines.filter(m => {
              // Giữ lại thuốc tạm thời chưa đồng bộ
              if (m._isTemp || (m.MedicineID && m.MedicineID.startsWith('MED_'))) return true;

              // Giữ lại thuốc pending sync không có trong danh sách mới
              if (m._pendingSync && !newMedicineIds.includes(m.MedicineID)) return true;

              // Còn lại sẽ bị thay thế bởi dữ liệu mới
              return false;
            });

            // Kết hợp thuốc pending với thuốc mới từ server
            const updatedMedicines = [...pendingMedicines, ...processedMedicines];

            // Debug
            console.log('🔄 Đã cập nhật dữ liệu thuốc của parent:', {
              pending: pendingMedicines.length,
              mới: processedMedicines.length,
              tổngSau: updatedMedicines.length
            });

            // Lưu vào localStorage
            saveMedicinesToStorage(updatedMedicines);

            return updatedMedicines;
          });

          // Kiểm tra một số thuốc test
          console.log('🔍 Kiểm tra M0001:', allMedicines.find(m =>
            m.medicineID === 'M0001' || m.MedicineID === 'M0001'));
          console.log('🔍 Kiểm tra M0002:', allMedicines.find(m =>
            m.medicineID === 'M0002' || m.MedicineID === 'M0002'));
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
    <div className="min-h-screen bg-gray-50">
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
          minHeight: 120
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
            <span style={{ fontSize: 44, filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.13))" }}>💊</span>
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
                marginBottom: 8
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
                  boxShadow: "0 0 0 4px rgba(16,185,129,0.18)"
                }}
              />
              <span
                style={{
                  fontSize: 17,
                  color: "#f3f4f6",
                  fontWeight: 500,
                  textShadow: "1px 1px 3px rgba(0,0,0,0.10)"
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
              boxShadow: "0 2px 8px rgba(22,160,133,0.12)"
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 4 }}>
              <span role="img" aria-label="list">📋</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{totalMedicines}</div>
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
              boxShadow: "0 2px 8px rgba(22,160,133,0.12)"
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 4 }}>
              <span role="img" aria-label="clock">⏰</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {new Date().toLocaleDateString('vi-VN')}
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
                boxShadow: "0 8px 32px rgba(127,90,240,0.07), 0 0 0 1px #f3f4f6",
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
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.13)",
                      border: "2px solid rgba(255,255,255,0.2)",
                      transform: "perspective(1000px) rotateX(5deg)",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                    }}
                  >
                    <span style={{
                      color: "white",
                      fontSize: 20,
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}>💊</span>
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
                  <div style={{
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    borderRadius: 18,
                    padding: "20px 0",
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                    border: "2px solid rgba(255,255,255,0.2)",
                    transform: "perspective(1000px) rotateX(1deg)",
                    transition: "all 0.3s ease",
                  }}>
                    <div style={{
                      fontSize: 36,
                      marginBottom: 8,
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                    }}>🕛</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>{pendingCount}</div>
                    <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>Chờ xử lý</div>
                  </div>
                </Col>
                <Col xs={12} md={4}>
                  <div style={{
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    borderRadius: 18,
                    padding: "20px 0",
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                    border: "2px solid rgba(255,255,255,0.2)",
                    transform: "perspective(1000px) rotateX(1deg)",
                    transition: "all 0.3s ease",
                  }}>
                    <div style={{
                      fontSize: 36,
                      marginBottom: 8,
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                    }}>✔️</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>{approvedCount}</div>
                    <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>Đã duyệt</div>
                  </div>
                </Col>
                <Col xs={12} md={4}>
                  <div style={{
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    borderRadius: 18,
                    padding: "20px 0",
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                    border: "2px solid rgba(255,255,255,0.2)",
                    transform: "perspective(1000px) rotateX(1deg)",
                    transition: "all 0.3s ease",
                  }}>
                    <div style={{
                      fontSize: 36,
                      marginBottom: 8,
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                    }}>💊</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>{inUseCount}</div>
                    <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>Đang sử dụng</div>
                  </div>
                </Col>
                <Col xs={12} md={4}>
                  <div style={{
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    borderRadius: 18,
                    padding: "20px 0",
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                    border: "2px solid rgba(255,255,255,0.2)",
                    transform: "perspective(1000px) rotateX(1deg)",
                    transition: "all 0.3s ease",
                  }}>
                    <div style={{
                      fontSize: 36,
                      marginBottom: 8,
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                    }}>🎯</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>{completedCount}</div>
                    <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>Hoàn thành</div>
                  </div>
                </Col>
                <Col xs={12} md={4}>
                   <div style={{
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    borderRadius: 18,
                    padding: "20px 0",
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                    border: "2px solid rgba(255,255,255,0.2)",
                    transform: "perspective(1000px) rotateX(1deg)",
                    transition: "all 0.3s ease",
                  }}>
                    <div style={{
                      fontSize: 36,
                      marginBottom: 8,
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                    }}>❌</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>{rejectedCount}</div>
                    <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>Từ chối</div>
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
            border: "none"
          }}
          bodyStyle={{ padding: 18 }}
        >
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            {/* Nhóm 2 cột filter */}
            <Col xs={24} sm={16} md={10} lg={8}>
              <Row gutter={12} align="middle">
                {/* Trạng thái */}
                <Col xs={12} sm={12} md={12} lg={12}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 18, color: "#e11d48" }}>🎯</span>
                    <span style={{ fontWeight: 600, color: "#334155" }}>Trạng thái</span>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 18, color: "#0ea5e9" }}>👦</span>
                    <span style={{ fontWeight: 600, color: "#334155" }}>Học sinh</span>
                  </div>
                  <Select
                    placeholder="Chọn học sinh"
                    style={{ width: "100%" }}
                    value={selectedStudentId}
                    onChange={(value) => {
                      setSelectedStudentId(value);
                      setStatusFilter('');
                    }}
                    loading={studentsLoading}
                    showSearch
                    optionFilterProp="children"
                    allowClear
                    size="middle"
                  >
                    {students.map(student => (
                      <Option key={student.StudentID} value={student.StudentID}>
                        {student.StudentName} - {student.Class || 'Chưa phân lớp'}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Col>

            {/* Thêm thuốc mới + Cập nhật (nằm cùng 1 cột, bên phải) */}
            <Col xs={24} sm={8} md={14} lg={16} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  style={{
                    borderRadius: "8px",
                    background: "linear-gradient(135deg,rgb(32, 81, 195) 0%,rgb(42, 100, 215) 100%)",
                    borderColor: "#52c41a",
                    boxShadow: "0 4px 12px rgba(68, 123, 211, 0.3)",
                    fontWeight: "600"
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
                    border: "none"
                  }}
                >
                  Cập nhật lúc <span style={{ fontWeight: 700 }}>{new Date().toLocaleTimeString('vi-VN')}</span>
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
                <Text className="text-sm text-gray-500" style={{ display: "flex", marginTop: 2 }}>
                  Tổng cộng: {totalMedicines} yêu cầu
                </Text>
              </span>
              <div className="flex items-center space-x-2" style={{ marginRight: 10 }}>
              </div>
            </div>
          }
          className="shadow-sm"
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
              size: 'small'
            }}
            scroll={{
              x: 780,
              y: 400
            }}
            size="small"
            bordered
            locale={{
              emptyText: loading ? 'Đang tải...' : (
                <div className="text-center py-8">
                  <MedicineBoxOutlined className="text-4xl text-gray-300 mb-2" />
                  <div className="text-gray-500">Chưa có yêu cầu thuốc nào</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {selectedStudentId
                      ? `Chưa có yêu cầu nào cho ${getStudentName(selectedStudentId)} - ${getStudentClass(selectedStudentId)}`
                      : 'Hãy chọn học sinh để xem yêu cầu thuốc'
                    }
                  </div>
                </div>
              )
            }}
          />
        </Card>

        {/* Modal tạo/sửa */}
        <Modal
          title={
            <div className="flex items-center">
              <MedicineBoxOutlined className="text-blue-500 mr-2" />
              {editingMedicine ? 'Chỉnh sửa yêu cầu thuốc' : 'Tạo yêu cầu thuốc mới'}
              {selectedStudentId && (
                <span className="ml-2 text-sm text-gray-500">
                  cho {getStudentName(selectedStudentId)} - {getStudentClass(selectedStudentId)}
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
                  rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
                >
                  <Input placeholder="Ví dụ: Paracetamol" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Quantity"
                  label="Số lượng"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                >
                  <Input placeholder="Ví dụ: 2 viên/ngày - 10 viên" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="Dosage"
              label="Liều lượng"
              rules={[{ required: true, message: 'Vui lòng nhập liều lượng' }]}
            >
              <Input placeholder="Ví dụ: 1 viên/lần, 2 lần/ngày" size="large" />
            </Form.Item>

            <Form.Item
              name="Instructions"
              label="Hướng dẫn sử dụng"
            >
              <TextArea
                rows={3}
                placeholder="Nhập hướng dẫn sử dụng thuốc (không bắt buộc)"
              />
            </Form.Item>

            <Form.Item
              name="Notes"
              label="Ghi chú"
            >
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
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Kéo thả hoặc click để tải ảnh</p>
                <p className="ant-upload-hint">
                  Tối đa 3 ảnh, định dạng: JPG, PNG
                </p>
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
                {editingMedicine ? 'Cập nhật' : 'Tạo yêu cầu'}
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
            <Button key="close" onClick={() => setIsViewModalVisible(false)} size="large">
              Đóng
            </Button>
          ]}
          width={800}
        >
          {viewingMedicine && (
            <div className="space-y-6">
              <Descriptions title="Thông tin yêu cầu thuốc" bordered column={2}>
                <Descriptions.Item label="Mã yêu cầu">
                  {viewingMedicine.MedicineID}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag
                    color={getStatusColor(viewingMedicine.Status)}
                    icon={getStatusIcon(viewingMedicine.Status)}
                  >
                    {normalizeStatus(viewingMedicine.Status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tên thuốc">
                  {viewingMedicine.MedicineName}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng">
                  {viewingMedicine.Quantity}
                </Descriptions.Item>
                <Descriptions.Item label="Liều lượng" span={2}>
                  {viewingMedicine.Dosage}
                </Descriptions.Item>
                <Descriptions.Item label="Hướng dẫn sử dụng" span={2}>
                  {viewingMedicine.Instructions || 'Không có'}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={2}>
                  {viewingMedicine.Notes || 'Không có'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày gửi">
                  {viewingMedicine.SentDate
                    ? new Date(viewingMedicine.SentDate).toLocaleString('vi-VN')
                    : 'Chưa có'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Học sinh">
                  {getStudentName(viewingMedicine.StudentID)} - {getStudentClass(viewingMedicine.StudentID)}
                </Descriptions.Item>
              </Descriptions>

              {viewingMedicine.Images && viewingMedicine.Images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Hình ảnh thuốc</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {viewingMedicine.Images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Medicine ${index + 1}`}
                        className="w-full h-24 object-cover rounded border hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
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
            </Button>
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
                      Mã: {viewingMedicineHistory.MedicineID} |
                      Học sinh: {getStudentName(viewingMedicineHistory.StudentID)} - {getStudentClass(viewingMedicineHistory.StudentID)}
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
                              {entry.action === 'UPDATE' ? 'Cập nhật' : entry.action}
                            </span>
                            <span className="text-sm text-gray-500">
                              bởi {entry.updatedBy || 'Parent'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(entry.timestamp).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        {/* Changes */}
                        {entry.changedFields && entry.changedFields.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Các thay đổi:</p>
                            {entry.changedFields.map((change, changeIndex) => (
                              <div key={changeIndex} className="bg-gray-50 p-2 rounded text-sm">
                                <div className="font-medium text-gray-700 mb-1">
                                  {getFieldDisplayName(change.field)}:
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-xs text-gray-500">Trước:</span>
                                    <div className="bg-red-50 text-red-700 p-1 rounded text-xs">
                                      {change.from || '(Trống)'}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Sau:</span>
                                    <div className="bg-green-50 text-green-700 p-1 rounded text-xs">
                                      {change.to || '(Trống)'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
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
      </div>
    </div>
  );
};
export default MedicineManagement;