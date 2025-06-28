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
  Typography
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
    fetchStudents();
    loadPersistedMedicines();
    fetchMedicinesFromServer();
  }, []);

  // Student change handler
  useEffect(() => {
    if (selectedStudentId) {
      console.log('🔄 Student changed to:', selectedStudentId);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  }, [selectedStudentId]);

  // ==================== PERSISTENCE FUNCTIONS ====================

  const saveMedicinesToStorage = (medicinesList) => {
    try {
      const dataToSave = {
        medicines: medicinesList,
        timestamp: new Date().toISOString(),
        version: '4.0'
      };
      localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('💾 Saved medicines to storage:', medicinesList.length);
    } catch (error) {
      console.error('❌ Error saving medicines:', error);
    }
  };

  const loadPersistedMedicines = () => {
    try {
      const cached = localStorage.getItem(MEDICINES_STORAGE_KEY);
      if (cached) {
        const parsedData = JSON.parse(cached);
        const medicinesList = parsedData.medicines || parsedData;
        if (Array.isArray(medicinesList) && medicinesList.length > 0) {
          // ✅ Filter out temp medicines (bỏ "Chờ đồng bộ")
          const realMedicines = medicinesList.filter(m => !m.MedicineID.startsWith('MED_'));
          setMedicines(realMedicines);
          console.log('📂 Loaded persisted medicines:', realMedicines.length);
        }
      }
    } catch (error) {
      console.error('❌ Error loading persisted medicines:', error);
    }
  };

  const updateMedicinesWithPersistence = (newMedicines) => {
    console.log('🔄 Updating medicines with persistence:', newMedicines.length);
    setMedicines(newMedicines);
    saveMedicinesToStorage(newMedicines);
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
    const statusMap = {
      'Chờ xử lý': 'Chờ xử lý',
      'Đã xác nhận': 'Đã xác nhận',
      'Đang thực hiện': 'Đang thực hiện',
      'Đã hoàn thành': 'Đã hoàn thành',
      'Từ chối': 'Từ chối',
      'Chờ xác nhận': 'Chờ xác nhận',
      // Handle encoded variants from server
      'T? ch?i': 'Từ chối',
      'Ðang th?c hi?n': 'Đang thực hiện',
      'Ðã xác nh?n': 'Đã xác nhận',
      'Ðã hoàn thành': 'Đã hoàn thành',
      'Ch? xác nh?n': 'Chờ xác nhận',
      'Ch? x? lý': 'Chờ xử lý'
    };

    return statusMap[status] || status;
  };

  const fetchMedicinesFromServer = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching medicines from server...');

      const response = await medicineApi.parent.GetMedicinesByStudentID();
      let serverMedicines = [];

      if (response?.data) {
        if (Array.isArray(response.data)) {
          serverMedicines = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          serverMedicines = response.data.data;
        }
      }

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
        Images: medicine.images || medicine.Images || []
      }));

      console.log('📦 Processed server medicines:', processedServerMedicines.length);

      // ✅ SMART MERGE - PRESERVE LOCAL CHANGES
      setMedicines(prevMedicines => {
        // Nếu không có local medicines, dùng server medicines
        if (prevMedicines.length === 0) {
          console.log('📥 No local medicines, using server data');
          saveMedicinesToStorage(processedServerMedicines);
          return processedServerMedicines;
        }

        // ✅ MERGE: Update existing + add new from server
        const mergedMedicines = [...prevMedicines];

        processedServerMedicines.forEach(serverMed => {
          const existingIndex = mergedMedicines.findIndex(localMed =>
            localMed.MedicineID === serverMed.MedicineID
          );

          if (existingIndex !== -1) {
            // ✅ Update existing medicine with server data (nếu cần)
            const localMed = mergedMedicines[existingIndex];
            if (localMed.MedicineName !== serverMed.MedicineName ||
              localMed.Status !== serverMed.Status) {
              console.log('🔄 Merging server updates for:', serverMed.MedicineID);
              mergedMedicines[existingIndex] = {
                ...localMed,
                ...serverMed // Server data takes precedence
              };
            }
          } else {
            // ✅ Add new medicine from server
            console.log('➕ Adding new medicine from server:', serverMed.MedicineID);
            mergedMedicines.push(serverMed);
          }
        });

        console.log('🔄 Merge result:', {
          localCount: prevMedicines.length,
          serverCount: processedServerMedicines.length,
          finalCount: mergedMedicines.length
        });

        saveMedicinesToStorage(mergedMedicines);
        return mergedMedicines;
      });

      if (processedServerMedicines.length > 0) {
        message.success(`✅ Đã đồng bộ ${processedServerMedicines.length} yêu cầu từ server`);
      }

    } catch (error) {
      console.error('❌ Error fetching medicines from server:', error);
      if (error.response?.status !== 404) {
        message.warning(`⚠️ Lỗi tải từ server: ${error.message}`);
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
    return student ? student.Class : '';
  };

  const getCurrentStudentMedicines = () => {
    console.log('🔍 Filtering medicines:', {
      totalMedicines: medicines.length,
      selectedStudentId,
      statusFilter
    });

    let filteredMedicines = medicines;

    // Filter by student
    if (selectedStudentId) {
      filteredMedicines = filteredMedicines.filter(m => m.StudentID === selectedStudentId);
      console.log('📋 After student filter:', filteredMedicines.length);
    }

    // Filter by status
    if (statusFilter) {
      filteredMedicines = filteredMedicines.filter(m => {
        const normalizedMedicineStatus = normalizeStatus(m.Status);
        const normalizedFilterStatus = normalizeStatus(statusFilter);
        return normalizedMedicineStatus === normalizedFilterStatus;
      });
      console.log('📋 After status filter:', filteredMedicines.length);
    }

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

      const images = fileList.map(file => file.originFileObj).filter(Boolean);

      const medicineData = {
        MedicineName: values.MedicineName.trim(),
        Quantity: values.Quantity.trim(),
        Dosage: values.Dosage.trim(),
        Instructions: values.Instructions?.trim() || '',
        Notes: values.Notes?.trim() || '',
        StudentID: selectedStudentId,
        Images: images
      };

      if (editingMedicine) {
        console.log('🔄 STARTING UPDATE for medicine:', editingMedicine.MedicineID);

        // ✅ LƯU HISTORY TRƯỚC KHI UPDATE
        const historyEntry = {
          action: 'UPDATE',
          previousData: {
            MedicineName: editingMedicine.MedicineName,
            Quantity: editingMedicine.Quantity,
            Dosage: editingMedicine.Dosage,
            Instructions: editingMedicine.Instructions,
            Notes: editingMedicine.Notes,
            Status: editingMedicine.Status
          },
          newData: {
            MedicineName: medicineData.MedicineName,
            Quantity: medicineData.Quantity,
            Dosage: medicineData.Dosage,
            Instructions: medicineData.Instructions,
            Notes: medicineData.Notes,
            Status: editingMedicine.Status // Status không thay đổi
          },
          changedFields: getChangedFields(editingMedicine, medicineData),
          updatedBy: 'Parent',
          reason: 'Manual update by parent'
        };

        // ✅ Lưu history
        saveMedicineHistory(editingMedicine.MedicineID, historyEntry);

        // ✅ Create updated medicine object
        const updatedMedicine = {
          // Keep essential metadata
          MedicineID: editingMedicine.MedicineID,
          StudentID: editingMedicine.StudentID,
          Status: editingMedicine.Status,
          SentDate: editingMedicine.SentDate,
          NurseID: editingMedicine.NurseID,
          ParentID: editingMedicine.ParentID,

          // Update with new data
          MedicineName: medicineData.MedicineName,
          Quantity: medicineData.Quantity,
          Dosage: medicineData.Dosage,
          Instructions: medicineData.Instructions,
          Notes: medicineData.Notes,

          // Handle images
          Images: images.length > 0
            ? images.map(file => URL.createObjectURL(file))
            : editingMedicine.Images || []
        };

        // ✅ UPDATE LOCAL STATE
        setMedicines(prevMedicines => {
          const updatedMedicines = prevMedicines.map(med => {
            if (med.MedicineID === editingMedicine.MedicineID) {
              return updatedMedicine;
            }
            return med;
          });
          saveMedicinesToStorage(updatedMedicines);
          return updatedMedicines;
        });

        message.success('✅ Cập nhật thuốc thành công!');

        // ✅ API call
        try {
          const apiData = {
            medicineID: editingMedicine.MedicineID,
            ...medicineData
          };

          const updateResponse = await medicineApi.parent.UpdateMedicine(apiData);

          if (updateResponse?.data) {
            console.log('✅ API update successful');
            message.success('✅ Đã đồng bộ với server!');
          }
        } catch (updateError) {
          console.error('❌ API update failed:', updateError);
          message.warning('⚠️ Cập nhật cục bộ thành công, lỗi đồng bộ server');
        }

      } else {
        // ✅ CREATE NEW MEDICINE
        console.log('🔄 Creating new medicine via API...');

        try {
          const createResponse = await medicineApi.parent.CreateMedicine(medicineData);

          if (createResponse?.data?.medicineID || createResponse?.data?.MedicineID) {
            const realId = createResponse.data.medicineID || createResponse.data.MedicineID;

            // ✅ Create new medicine with real ID from server
            const newMedicine = {
              MedicineID: realId,
              ...medicineData,
              Status: 'Chờ xử lý',
              Images: images.map(file => URL.createObjectURL(file)),
              SentDate: new Date().toISOString(),
              NurseID: null,
              ParentID: null
            };

            // ✅ ADD to existing medicines
            setMedicines(prevMedicines => {
              const updatedMedicines = [...prevMedicines, newMedicine];
              saveMedicinesToStorage(updatedMedicines);
              return updatedMedicines;
            });

            message.success('✅ Tạo yêu cầu thuốc thành công!');
          }
        } catch (createError) {
          console.error('❌ Create API failed:', createError);
          message.error(`❌ Lỗi tạo yêu cầu: ${createError.message}`);
        }
      }

      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      setEditingMedicine(null);

    } catch (error) {
      console.error('❌ Submit error:', error);
      message.error(`❌ Có lỗi xảy ra: ${error.message}`);
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
  const processedCount = currentStudentMedicines.filter(m => normalizeStatus(m.Status) === 'Đã xác nhận').length;
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
      render: (studentId, record) => {
        const student = students.find(s => s.StudentID === studentId);
        return (
          <div>
            <div className="font-medium text-xs">{student?.StudentName || 'N/A'}</div>
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
          <div className="font-medium text-gray-900 text-xs">{text}</div>
          <div className="text-xs text-gray-600">
            <span className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded text-xs mr-1">
              {record.Quantity}
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
          <div className="text-xs font-medium">
            {date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa có'}
          </div>
          <div className="text-xs text-gray-500">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="py-3">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MedicineBoxOutlined className="text-3xl text-blue-500 mr-3" />
                <Title level={4} className="!mb-0 text-blue-600">
                  Tạo yêu cầu gửi thuốc
                </Title>
              </div>
              <Text className="text-gray-600">
                Tạo yêu cầu gửi thuốc cho học sinh
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Statistics */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <Row gutter={16} align="middle">
            <Col span={4}>
              <div>
                <Text strong>Trạng thái</Text>
                <Select
                  placeholder="Tất cả trạng thái"
                  style={{ width: '100%', marginTop: 4 }}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  allowClear
                  size="default"
                >
                  <Option value="Chờ xử lý">Chờ xử lý</Option>
                  <Option value="Đã xác nhận">Đã xác nhận</Option>
                  <Option value="Đang thực hiện">Đang thực hiện</Option>
                  <Option value="Đã hoàn thành">Đã hoàn thành</Option>
                  <Option value="Từ chối">Từ chối</Option>
                </Select>
              </div>
            </Col>

            <Col span={4}>
              <div>
                <Text strong>Học sinh</Text>
                <Select
                  placeholder="Chọn học sinh"
                  style={{ width: '100%', marginTop: 4 }}
                  value={selectedStudentId}
                  onChange={(value) => {
                    setSelectedStudentId(value);
                    setStatusFilter('');
                  }}
                  loading={studentsLoading}
                  showSearch
                  optionFilterProp="children"
                  allowClear
                  size="default"
                >
                  {students.map(student => (
                    <Option key={student.StudentID} value={student.StudentID}>
                      {student.StudentName} - {student.Class}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            <Col span={6}></Col>

            <Col span={3}>
              <div style={{ marginTop: 18, marginLeft: 55 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  disabled={!selectedStudentId}
                  className="bg-blue-500 hover:bg-blue-600"
                  size="default"
                >
                  Thêm thuốc mới
                </Button>
              </div>
            </Col>
            <Col span={2}></Col>

            <Col span={1.5}>
              <div className="text-center">
                <div className="text-base font-bold text-orange-600">{pendingCount}</div>
                <div className="text-xs text-gray-500 whitespace-nowrap">Chờ xử lý</div>
              </div>
            </Col>

            <Col span={1.5}>
              <div className="text-center">
                <div className="text-base font-bold text-green-600">{processedCount}</div>
                <div className="text-xs text-gray-500 whitespace-nowrap">Đã xác nhận</div>
              </div>
            </Col>

            <Col span={1.5}>
              <div className="text-center">
                <div className="text-base font-bold text-red-600">{rejectedCount}</div>
                <div className="text-xs text-gray-500 whitespace-nowrap">Từ chối</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Main Table */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <span>
                Danh sách yêu cầu thuốc
                <Text className="ml-2 text-sm text-gray-500">
                  Tổng cộng: {totalMedicines} yêu cầu
                </Text>
              </span>
              <div className="flex items-center space-x-2">
                <Text className="text-sm">Cập nhật: {new Date().toLocaleString('vi-VN')}</Text>
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={fetchMedicinesFromServer}
                  loading={loading}
                  className="text-green-500"
                  size="small"
                />
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
              x: 780, // ✅ Giảm từ 1200 xuống 780 (tổng width của các cột)
              y: 400  // ✅ Thêm scroll vertical để table không quá cao
            }}
            size="small" // ✅ Đổi từ "middle" thành "small" cho compact hơn
            bordered // ✅ Thêm border để thấy rõ cột
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

        {/* Create/Edit Modal */}
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

        {/* View Modal */}
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

        {/* ✅ HISTORY MODAL */}
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