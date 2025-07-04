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

    // Sau đó mới tải dữ liệu từ server và các thao tác khác
    fetchStudents();
    fetchMedicinesFromServer();

    // Thêm listeners cho trạng thái online/offline
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    // Thêm listener cho thay đổi localStorage từ tab khác
    window.addEventListener('storage', handleStorageChange);

    // Tạo interval để cố gắng đồng bộ định kỳ
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        const pendingSyncMedicines = medicines.filter(m => m._pendingSync === true || m._isTemp === true);
        if (pendingSyncMedicines.length > 0) {
          console.log('⏱️ Tự động đồng bộ định kỳ:', pendingSyncMedicines.length, 'yêu cầu');
          syncPendingMedicines(pendingSyncMedicines);
        }
      }
    }, 120000); // 2 phút thử đồng bộ một lần

    return () => {
      // Cleanup listeners khi component unmount
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(syncInterval);

      // Lưu lại state medicines khi component unmount để đảm bảo không mất dữ liệu
      saveMedicinesToStorage(medicines);
    };
  }, []);

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

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      console.log('🔄 Fetching students from API...');

      const response = await studentApi.parent.getMyChildren();
      console.log('✅ Students API response:', response);

      const studentsData = response.data || [];

      const processedStudents = studentsData.map(student => {
        const age = new Date().getFullYear() - new Date(student.birthday).getFullYear();
        const estimatedGrade = Math.max(1, Math.min(12, age - 5));

        return {
          StudentID: student.studentID,
          StudentName: student.studentName,
          StudentCode: student.studentID,
          Age: age,
          Sex: student.sex,
          Birthday: student.birthday,
          Location: student.location,
          ParentName: student.parentName,
          ParentEmail: student.parentEmail,
          ParentPhone: student.parentPhone,
          Nationality: student.nationality,
          Ethnicity: student.ethnicity,
          Class: `Lớp ${estimatedGrade}`
        };
      });

      console.log('📋 Processed students:', processedStudents);
      setStudents(processedStudents);

      if (processedStudents.length > 0 && !selectedStudentId) {
        setSelectedStudentId(processedStudents[0].StudentID);
      }

      message.success(`Đã tải ${processedStudents.length} học sinh`);

    } catch (error) {
      console.error('❌ Error fetching students:', error);

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
      if (mockStudents.length > 0 && !selectedStudentId) {
        setSelectedStudentId(mockStudents[0].StudentID);
      }

      message.warning('Sử dụng dữ liệu mẫu - Vui lòng kiểm tra kết nối');
    } finally {
      setStudentsLoading(false);
    }
  };

  const normalizeStatus = (status) => {
    // Nếu status không tồn tại, trả về giá trị mặc định
    if (!status) return 'Chờ xử lý';

    // Đưa về chữ thường và bỏ dấu cách thừa để dễ so sánh
    const cleanStatus = status.toLowerCase().trim();

    // Mapping đầy đủ hơn để xử lý các trường hợp khác nhau
    const statusMap = {
      // Các trạng thái tiếng Việt chuẩn
      'chờ xử lý': 'Chờ xử lý',
      'đã xác nhận': 'Đã xác nhận',
      'đang thực hiện': 'Đang thực hiện',
      'đã hoàn thành': 'Đã hoàn thành',
      'từ chối': 'Từ chối',
      'chờ xác nhận': 'Chờ xác nhận',

      // Các trạng thái có thể bị mã hóa sai UTF-8
      'cho xu ly': 'Chờ xử lý',
      'cho xac nhan': 'Chờ xác nhận',
      'da xac nhan': 'Đã xác nhận',
      'dang thuc hien': 'Đang thực hiện',
      'da hoan thanh': 'Đã hoàn thành',
      'tu choi': 'Từ chối',

      // Các trạng thái mã hóa sai tiềm ẩn từ server
      'ch? x? lý': 'Chờ xử lý',
      'ch? xác nh?n': 'Chờ xác nhận',
      'ðã xác nh?n': 'Đã xác nhận',
      'ðang th?c hi?n': 'Đang thực hiện',
      'ðã hoàn thành': 'Đã hoàn thành',
      't? ch?i': 'Từ chối',

      // Các trạng thái viết tắt hoặc sai chính tả
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
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
    if (result) return result;

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

    // Lấy dữ liệu từ server
    let serverMedicines = [];
    try {
      const allMedicinesResponse = await medicineApi.parent.getAllMedicines();
      if (allMedicinesResponse?.data) {
        if (Array.isArray(allMedicinesResponse.data)) {
          serverMedicines = allMedicinesResponse.data;
        } else if (allMedicinesResponse.data.data && Array.isArray(allMedicinesResponse.data.data)) {
          serverMedicines = allMedicinesResponse.data.data;
        }
      }
    } catch (error) {
      // Nếu lỗi, fallback về localStorage
      loadPersistedMedicines();
      setLoading(false);
      return;
    }

    if (serverMedicines.length === 0) {
      // Nếu server trả về rỗng, fallback về localStorage
      loadPersistedMedicines();
      setLoading(false);
      return;
    }

    // Chuẩn hóa dữ liệu từ server
    const processedServerMedicines = serverMedicines.map(medicine => ({
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
      Images: medicine.images || medicine.Images || [],
      _fromServer: true,
      _serverFetchedAt: new Date().toISOString()
    }));

    // Chỉ giữ lại các thuốc đang chờ đồng bộ (nếu có)
    const pendingMedicines = medicines.filter(m => m._pendingSync === true || m._isTemp === true);
    const combinedMedicines = [
      ...processedServerMedicines,
      ...pendingMedicines.filter(m => !processedServerMedicines.some(s => s.MedicineID === m.MedicineID))
    ];

    setMedicines(combinedMedicines);
    saveMedicinesToStorage(combinedMedicines);
    message.success(`Đã tải ${processedServerMedicines.length} yêu cầu thuốc từ server`);
  } catch (error) {
    message.error('Không thể kết nối đến server - Hiển thị dữ liệu cục bộ');
    loadPersistedMedicines();
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
    return student ? student.Class : '';
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

    // Kiểm tra cụ thể M0001 và M0002
    const m0001 = medicines.find(m => m.MedicineID === 'M0001');
    const m0002 = medicines.find(m => m.MedicineID === 'M0002');

    console.log('Kiểm tra M0001:', m0001 ? {
      id: m0001.MedicineID,
      name: m0001.MedicineName,
      student: m0001.StudentID,
      status: m0001.Status
    } : 'Không tìm thấy');

    console.log('Kiểm tra M0002:', m0002 ? {
      id: m0002.MedicineID,
      name: m0002.MedicineName,
      student: m0002.StudentID,
      status: m0002.Status
    } : 'Không tìm thấy');

    let filteredMedicines = medicines;

    // Filter by student
    if (selectedStudentId) {
      console.log(`Đang lọc theo học sinh: ${selectedStudentId}`);

      // So sánh chi tiết để debug
      if (m0001) {
        console.log('So sánh StudentID của M0001:', {
          id_m0001: m0001.StudentID,
          id_selected: selectedStudentId,
          giống_nhau_chính_xác: m0001.StudentID === selectedStudentId,
          giống_nhau_không_phân_biệt_hoa_thường:
            m0001.StudentID.toLowerCase() === selectedStudentId.toLowerCase()
        });
      }

      // Sử dụng so sánh không phân biệt chữ hoa/thường để tránh lỗi case sensitivity
      filteredMedicines = filteredMedicines.filter(m =>
        m.StudentID && selectedStudentId &&
        m.StudentID.toLowerCase() === selectedStudentId.toLowerCase()
      );

      console.log(`Sau khi lọc theo học sinh: ${filteredMedicines.length} thuốc còn lại`);
      console.log('ID thuốc sau khi lọc học sinh:', filteredMedicines.map(m => m.MedicineID));
    }

    // Filter by status
    if (statusFilter) {
      console.log(`Đang lọc theo trạng thái: ${statusFilter}`);

      // Kiểm tra chuẩn hóa trạng thái
      if (m0001 && filteredMedicines.includes(m0001)) {
        console.log('Trạng thái của M0001:', {
          gốc: m0001.Status,
          đã_chuẩn_hóa: normalizeStatus(m0001.Status),
          trạng_thái_lọc: statusFilter,
          trạng_thái_lọc_đã_chuẩn_hóa: normalizeStatus(statusFilter),
          giống_nhau_sau_chuẩn_hóa: normalizeStatus(m0001.Status) === normalizeStatus(statusFilter)
        });
      }

      filteredMedicines = filteredMedicines.filter(m => {
        const normalizedMedicineStatus = normalizeStatus(m.Status);
        const normalizedFilterStatus = normalizeStatus(statusFilter);
        return normalizedMedicineStatus === normalizedFilterStatus;
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
            : editingMedicine.Images || []
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
          const updateResponse = await medicineApi.parent.updateMedicine(apiData);
          console.log('Kết quả cập nhật từ server:', updateResponse);

          message.success('Cập nhật thuốc thành công!');
        } catch (updateError) {
          console.error('Lỗi khi cập nhật thuốc trên server:', updateError);
          message.warning('Đã lưu cục bộ, nhưng không thể cập nhật trên server. Thay đổi sẽ được đồng bộ khi có kết nối.');
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
    const canEditStatus = normalizedStatus === 'Chờ xử lý';

    console.log('🔍 Can edit check:', {
      medicineId: record.MedicineID,
      originalStatus: record.Status,
      normalizedStatus: normalizedStatus,
      canEdit: canEditStatus
    });

    return canEditStatus;
  };

  // Get statistics
  const currentStudentMedicines = getCurrentStudentMedicines();
  const totalMedicines = currentStudentMedicines.length;
  const pendingCount = currentStudentMedicines.filter(m => normalizeStatus(m.Status) === 'Chờ xử lý').length;
  const approvedCount = currentStudentMedicines.filter(m => normalizeStatus(m.Status) === 'Đã duyệt').length;
  const inUseCount = currentStudentMedicines.filter(m => normalizeStatus(m.Status) === 'Đang sử dụng').length;
  const completedCount = currentStudentMedicines.filter(m => normalizeStatus(m.Status) === 'Hoàn thành').length;
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
              {student?.Class || 'N/A'}
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
          <div className="text-xs font-medium" style={{display:"flex"}}>
            {date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa có'}
          </div>
          <div className="text-xs text-gray-500" style={{display:"flex"}}>
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
        fetchMedicinesByStudentId(selectedStudentId);
      } else {
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }
    }
  }, [selectedStudentId]);

  // Hàm lấy thuốc theo mã học sinh
  const fetchMedicinesByStudentId = async (studentId) => {
    if (!studentId || !navigator.onLine) return;

    try {
      console.log(`👨‍👩‍👧‍👦 Đang lấy thuốc cho học sinh: ${studentId}`);
      const response = await medicineApi.parent.getMedicinesByStudentId(studentId);

      if (response?.data) {
        let studentMedicines = [];

        if (Array.isArray(response.data)) {
          studentMedicines = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          studentMedicines = response.data.data;
        } else if (response.data.medicineID || response.data.MedicineID) {
          studentMedicines = [response.data];
        }

        if (studentMedicines.length > 0) {
          console.log(`✅ Tìm thấy ${studentMedicines.length} thuốc của học sinh ${studentId}`);

          // Chuẩn hóa dữ liệu từ server
          const processedMedicines = studentMedicines.map(medicine => ({
            MedicineID: medicine.medicineID || medicine.MedicineID,
            MedicineName: medicine.medicineName || medicine.MedicineName,
            Quantity: medicine.quantity || medicine.Quantity,
            Dosage: medicine.dosage || medicine.Dosage,
            Instructions: medicine.instructions || medicine.Instructions || '',
            Notes: medicine.notes || medicine.Notes || '',
            Status: normalizeStatus(medicine.status || medicine.Status || 'Chờ xử lý'),
            SentDate: medicine.sentDate || medicine.SentDate || medicine.createdAt,
            StudentID: medicine.studentID || medicine.StudentID || medicine.student_id || studentId,
            NurseID: medicine.nurseID || medicine.NurseID || null,
            ParentID: medicine.parentID || medicine.ParentID || null,
            Images: medicine.images || medicine.Images || [],
            _fromServer: true,
            _serverFetchedAt: new Date().toISOString()
          }));

          // Cập nhật medicines trong state
          setMedicines(prevMedicines => {
            // Lấy danh sách ID thuốc mới từ server
            const newMedicineIds = processedMedicines.map(m => m.MedicineID);

            // Giữ lại thuốc của học sinh khác và thuốc đang chờ đồng bộ
            const otherMedicines = prevMedicines.filter(m => {
              // Giữ lại nếu thuộc học sinh khác
              if (m.StudentID !== studentId) return true;

              // Hoặc là thuốc tạm thời chưa đồng bộ
              if (m._isTemp || m.MedicineID.startsWith('MED_')) return true;

              // Hoặc là thuốc cũ không có trong danh sách mới
              if (!newMedicineIds.includes(m.MedicineID)) return true;

              // Còn lại sẽ bị thay thế bởi dữ liệu mới
              return false;
            });

            // Kết hợp thuốc cũ với thuốc mới
            const updatedMedicines = [...otherMedicines, ...processedMedicines];

            // Debug
            console.log('🔄 Đã cập nhật dữ liệu thuốc của học sinh:', {
              cũ: prevMedicines.filter(m => m.StudentID === studentId).length,
              mới: processedMedicines.length,
              tổngSau: updatedMedicines.length
            });

            // Lưu vào localStorage
            saveMedicinesToStorage(updatedMedicines);

            return updatedMedicines;
          });

          // Kiểm tra M0001 và M0002
          console.log('🔍 Kiểm tra M0001:', studentMedicines.find(m =>
            m.medicineID === 'M0001' || m.MedicineID === 'M0001'));
          console.log('🔍 Kiểm tra M0002:', studentMedicines.find(m =>
            m.medicineID === 'M0002' || m.MedicineID === 'M0002'));
        } else {
          console.log(`ℹ️ Không tìm thấy thuốc nào của học sinh ${studentId}`);
        }
      }
    } catch (error) {
      console.error(`❌ Lỗi khi lấy thuốc của học sinh ${studentId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg, #7f5af0 0%, #ff6b9d 100%)",
          borderRadius: "32px",
          boxShadow: "0 10px 32px rgba(127,90,240,0.13)",
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
              background: "linear-gradient(135deg, #ffb86b 0%, #ff6b9d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(255,107,157,0.18), inset 0 2px 4px rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.2)"
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
              Tạo yêu cầu thuốc
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
                Gửi thuốc đến cho con em một cách dễ dàng
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
              boxShadow: "0 2px 8px rgba(127,90,240,0.09)"
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
              boxShadow: "0 2px 8px rgba(127,90,240,0.09)"
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
                      border: "2px solid rgba(255,255,255,0.2)"
                    }}
                  >
                    <span style={{ color: "white", fontSize: 20 }}>❓</span>
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
                <Col xs={24} sm={12} md={5}>
                  <div style={{
                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    borderRadius: 18,
                    padding: "20px 0",
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(245,158,11,0.10)"
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>⏳</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#d97706" }}>{pendingCount}</div>
                    <div style={{ fontSize: 14, color: "#92400e", fontWeight: 600 }}>Chờ xử lý</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={5}>
                  <div style={{
                    background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                    borderRadius: 18,
                    padding: "20px 0",
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(34,197,94,0.10)"
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#16a34a" }}>{approvedCount}</div>
                    <div style={{ fontSize: 14, color: "#15803d", fontWeight: 600 }}>Đã duyệt</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={5}>
                  <div style={{
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    borderRadius: 18,
                    padding: "20px 0",
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(59,130,246,0.10)"
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>💊</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>{inUseCount}</div>
                    <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>Đang sử dụng</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={5}>
                  <div style={{
                    background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                    borderRadius: 18,
                    padding: "20px 0",
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(124,58,237,0.10)"
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🎯</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#7c3aed" }}>{completedCount}</div>
                    <div style={{ fontSize: 14, color: "#6d28d9", fontWeight: 600 }}>Hoàn thành</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <div style={{
                    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                    borderRadius: 18,
                    padding: "20px 0",
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(239,68,68,0.10)"
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>❌</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#dc2626" }}>{rejectedCount}</div>
                    <div style={{ fontSize: 14, color: "#b91c1c", fontWeight: 600 }}>Từ chối</div>
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
            background: "#f9fafb",
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(127,90,240,0.06)",
            border: "none"
          }}
          bodyStyle={{ padding: 18 }}
        >
          <Row gutter={0} align="middle" justify="space-between">
            {/* Trạng thái */}
            <Col xs={24} sm={8} md={6} lg={5}>
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
            <Col xs={24} sm={8} md={6} lg={5}>
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
                    {student.StudentName} - {student.Class}
                  </Option>
                ))}
              </Select>
            </Col>

            {/* Thêm thuốc mới + Cập nhật (nằm cùng 1 cột, bên phải) */}
            <Col xs={24} sm={16} md={12} lg={10} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  disabled={!selectedStudentId}
                  className="bg-blue-500 hover:bg-blue-600"
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
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={fetchMedicinesFromServer}
                  loading={loading}
                  className="text-green-500"
                  size="small"
                >
                  Tải lại
                </Button>
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
                      ? `Chưa có yêu cầu nào cho ${getStudentName(selectedStudentId)}`
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
                  cho {getStudentName(selectedStudentId)}
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
                      Học sinh: {getStudentName(viewingMedicineHistory.StudentID)}
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