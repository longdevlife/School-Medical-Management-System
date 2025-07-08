import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Space,
  message,
  Alert,
  Modal,
  Descriptions,
  Select,
  Input
} from 'antd';
import {
  EyeOutlined,
  ReloadOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import medicalEventApi from '../../api/medicalEventApi';
import studentApi from '../../api/studentApi';

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const MedicalEvent = () => {
  console.log('🔄 [RENDER] MedicalEvent component đang render...');

  // States
  const [medicalEvents, setMedicalEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('📊 [RENDER] Current medicalEvents state:', medicalEvents.length, 'items');
  console.log('📊 [RENDER] Current students state:', students.length, 'items');

  // Modal states
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Filter states
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(''); // Bộ lọc học sinh

  // Hàm lấy dữ liệu sự kiện y tế từ API
  const fetchMedicalEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Đang tải sự kiện y tế từ API...');
      console.log('🔗 Base URL:', 'https://localhost:7040/api/');
      console.log('🔗 Full URL:', 'https://localhost:7040/api/parent/event/getByStudentId');

      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token) {
        console.error('❌ Không có JWT token!');
        message.error('Vui lòng đăng nhập lại');
        return;
      }

      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token sample:', token.substring(0, 50) + '...');

      // Decode token để xem payload (chỉ để debug)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('👤 Token payload:', payload);
        console.log('👤 User role:', payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
        console.log('👤 Username:', payload.unique_name || payload.sub || payload.name);
      } catch (e) {
        console.warn('⚠️ Cannot decode token:', e);
      }

      // Gọi API để lấy dữ liệu sự kiện y tế
      const response = await medicalEventApi.parent.getMedicalEvents();
      const data = response.data;

      console.log('📥 Dữ liệu sự kiện y tế từ API:', data);
      console.log('📊 Kiểu dữ liệu:', typeof data);
      console.log('📊 Là array?:', Array.isArray(data));
      console.log('📊 Độ dài:', data?.length);

      // DEBUG: Log chi tiết cấu trúc dữ liệu
      if (data && data.length > 0) {
        console.log('🔍 [DEBUG] Cấu trúc item đầu tiên:', data[0]);
        console.log('🔍 [DEBUG] Tất cả keys của item đầu tiên:', Object.keys(data[0]));
        console.log('🔍 [DEBUG] Sample data structure:', JSON.stringify(data[0], null, 2));
      }

      // DEBUG: Kiểm tra từng điều kiện
      console.log('🔍 [CONDITION CHECK] data exists:', !!data);
      console.log('🔍 [CONDITION CHECK] is array:', Array.isArray(data));
      console.log('🔍 [CONDITION CHECK] length > 0:', data?.length > 0);
      console.log('🔍 [CONDITION CHECK] final check:', data && Array.isArray(data) && data.length > 0);

      // Sửa logic: Kiểm tra data có phải array và có length không
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ API trả về dữ liệu hợp lệ, đang map dữ liệu...');

        // Map dữ liệu từ backend format sang frontend format
        const mappedEvents = data.map((item, index) => {
          console.log(`🔄 [MAPPING] Item ${index + 1}:`, item);

          // Simple NurseID mapping
          const nurseID = item.nurseID || item.NurseID || '';
          console.log(`👩‍⚕️ [NURSE] NurseID for item ${index + 1}:`, nurseID);

          // DEBUG StudentID mapping - chi tiết hơn
          const studentIDRaw = item.studentID || item.StudentID || (Array.isArray(item.studentID) ? item.studentID[0] : '');
          const studentID = String(studentIDRaw).trim(); // Đảm bảo là string và loại bỏ khoảng trắng

          console.log(`👶 [STUDENT ID MAPPING] Item ${index + 1}:`);
          console.log(`  - Raw item.studentID:`, item.studentID);
          console.log(`  - Raw item.StudentID:`, item.StudentID);
          console.log(`  - studentIDRaw:`, studentIDRaw);
          console.log(`  - Final StudentID:`, studentID);
          console.log(`  - StudentID type:`, typeof studentID);
          console.log(`  - StudentID length:`, studentID.length);

          const mapped = {
            MedicalEventID: item.medicalEventID || item.MedicalEventID || `TEMP_${index + 1}`,
            EventDateTime: item.eventDateTime || item.EventDateTime || new Date().toISOString(),
            Description: item.description || item.Description || 'Không có mô tả',
            ActionTaken: item.actionTaken || item.ActionTaken || 'Chưa xử lý',
            Notes: item.notes || item.Notes || '',
            EventTypeID: item.eventTypeID || item.EventTypeID || item.eventType || 'Không xác định',
            NurseID: nurseID,
            StudentID: studentID,
            StudentName: item.studentName || item.StudentName || 'Chưa có tên',
            StudentClass: item.class || item.Class || item.studentClass || 'Chưa có lớp'
          };

          console.log(`✅ [MAPPING] Mapped item ${index + 1}:`, mapped);
          console.log(`📋 [MAPPING] Final StudentID in mapped object:`, mapped.StudentID);
          return mapped;
        });

        console.log('📋 [MAPPING] Tất cả dữ liệu đã map:', mappedEvents);

        console.log('🔄 [STATE] Setting medicalEvents state với:', mappedEvents.length, 'items');
        setMedicalEvents(mappedEvents);
        console.log('✅ [STATE] State đã được set');

        message.success(`Đã tải ${mappedEvents.length} sự kiện y tế từ server`);
      } else {
        console.log('⚠️ [ELSE BRANCH] Parent API trả về dữ liệu trống hoặc không hợp lệ');
        console.log('� [ELSE DEBUG] Data value:', data);
        console.log('� [ELSE DEBUG] Data type:', typeof data);
        console.log('� [ELSE DEBUG] Is array:', Array.isArray(data));
        console.log('� [ELSE DEBUG] Length:', data?.length);

        message.info('Không có sự kiện y tế nào từ server, hiển thị dữ liệu mẫu');
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy dữ liệu sự kiện y tế:', error);
      console.error('📛 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });

      // Log thêm thông tin về authentication
      if (error.response?.status === 401) {
        console.error('🔒 Authentication Error - Token có thể hết hạn hoặc không hợp lệ');
        message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      } else if (error.response?.status === 403) {
        console.error('🚫 Authorization Error - Không có quyền truy cập');
        message.error('Không có quyền truy cập chức năng này');
      } else if (error.response?.status === 404) {
        console.error('🔍 Not Found - API endpoint không tồn tại');
        message.error('API không tồn tại');
      } else {
        message.error('Lỗi kết nối server, hiển thị dữ liệu mẫu');
      }

      setError('Không thể tải dữ liệu sự kiện y tế từ server');
      // Không set empty array, giữ nguyên mock data
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách học sinh của phụ huynh
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      console.log('🔄 [STUDENTS] Đang lấy danh sách học sinh của phụ huynh...');

      const response = await studentApi.parent.getMyChildren();
      console.log('✅ [STUDENTS] API getMyChildren response:', response);

      const studentsData = response.data || [];

      if (Array.isArray(studentsData) && studentsData.length > 0) {
        const processedStudents = studentsData.map((student, index) => {
          // DEBUG StudentID mapping cho students
          const studentIDRaw = student.studentID || student.StudentID || student.id;
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
            StudentName: student.studentName || student.StudentName || student.name || 'Học sinh',
            Class: student.class || student.className || student.ClassName || student.grade || 'Chưa phân lớp',
            Age: student.age || 0,
            Sex: student.sex || student.gender || 'Chưa xác định',
            Birthday: student.birthday || student.dob || null
          };
        });

        console.log('📋 Danh sách học sinh đã xử lý:', processedStudents);
        console.log('🔍 [STUDENTS] All StudentIDs:', processedStudents.map(s => s.StudentID));
        setStudents(processedStudents);
        message.success(`Đã tải ${processedStudents.length} học sinh`);
      } else {
        console.log('⚠️ Không có học sinh nào');
        setStudents([]);
        message.info('Không có học sinh nào trong hệ thống');
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách học sinh:', error);
      message.error('Không thể tải danh sách học sinh');

      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Sử dụng dữ liệu mẫu cho development');
        setStudents(mockStudents);
      }
    } finally {
      setStudentsLoading(false);
    }
  };

  // Mock data cho học sinh của phụ huynh
  const mockStudents = [
    {
      StudentID: 'ST001',
      StudentName: 'Lê Văn Bình',
      Birthday: '2016-05-15',
      Class: '2A',
      Avatar: null
    },
    {
      StudentID: 'ST002',
      StudentName: 'Lê Thị Cẩm Ly',
      Birthday: '2014-08-22',
      Class: '4B',
      Avatar: null
    }
  ];

  // Mock data cho medical events - cập nhật để phù hợp với table format
  const mockMedicalEvents = [
    {
      MedicalEventID: 'ME2024001',
      EventDateTime: '2024-12-06T09:30:00',
      Description: 'Con bị đau đầu trong giờ học Toán',
      ActionTaken: 'Y tá đã cho con nghỉ ngơi và uống thuốc giảm đau',
      Notes: 'Cần theo dõi thêm nếu tình trạng tái diễn',
      EventTypeID: 'Đau đầu',
      NurseID: 'N001',
      NurseName: 'Nguyễn Thị Hạnh',
      NursePhone: '0912345678',
      StudentID: 'ST001', // Đảm bảo string
      StudentName: 'Lê Văn Bình',
      StudentClass: '2A'
    },
    {
      MedicalEventID: 'ME2024002',
      EventDateTime: '2024-12-05T14:15:00',
      Description: 'Con bị trầy xước đầu gối trong giờ thể dục',
      ActionTaken: 'Vệ sinh và băng bó vết thương',
      Notes: 'Vết thương không nghiêm trọng',
      EventTypeID: 'Chấn thương',
      NurseID: 'N001',
      NurseName: 'Nguyễn Thị Hạnh',
      NursePhone: '0912345678',
      StudentID: 'ST001', // Đảm bảo string
      StudentName: 'Lê Văn Bình',
      StudentClass: '2A'
    },
    {
      MedicalEventID: 'ME2024003',
      EventDateTime: '2024-12-04T11:20:00',
      Description: 'Con bị sốt nhẹ sau giờ ra chơi',
      ActionTaken: 'Đo nhiệt độ, cho nghỉ ngơi và thông báo phụ huynh',
      Notes: 'Nhiệt độ 37.5°C, đã liên hệ gia đình',
      EventTypeID: 'Sốt',
      NurseID: 'N001',
      NurseName: 'Nguyễn Thị Hạnh',
      NursePhone: '0912345678',
      StudentID: 'ST002', // Đảm bảo string
      StudentName: 'Lê Thị Cẩm Ly',
      StudentClass: '4B'
    }
  ];

  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Khởi tạo component MedicalEvent');
      console.log('🔑 Current token:', localStorage.getItem('token'));
      console.log('🔑 Current refresh token:', localStorage.getItem('refreshToken'));

      // Luôn hiển thị mock data trước để có giao diện
      console.log('🔄 Loading mock data for display...');
      setStudents(mockStudents);
      setMedicalEvents(mockMedicalEvents);

      // Sau đó thử tải dữ liệu thực từ API
      try {
        console.log('🌐 Bắt đầu gọi Parent API...');

        console.log('📞 [1/2] Gọi fetchStudents...');
        await fetchStudents();
        console.log('✅ [1/2] fetchStudents hoàn thành');

        console.log('📞 [2/2] Gọi fetchMedicalEvents...');
        await fetchMedicalEvents();
        console.log('✅ [2/2] fetchMedicalEvents hoàn thành');

        console.log('✅ Hoàn thành gọi API');
      } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu:', error);
        console.error('📛 Error stack:', error.stack);
        // Giữ nguyên mock data nếu API lỗi
      }
    };

    initializeData();
  }, []);

  // Filter functions
  const getEventTypeColor = (eventType) => {
    const colors = {
      'Đau đầu': 'orange',
      'Chấn thương': 'red',
      'Sốt': 'volcano',
      'Dị ứng': 'purple',
      'Khác': 'default'
    };
    return colors[eventType] || 'default';
  };

  // Handle view detail
  const handleViewDetail = (event) => {
    setSelectedEvent(event);
    setIsDetailModalVisible(true);
  };

  // Filter medical events based on filters
  const filteredEvents = medicalEvents.filter(event => {
    const matchesEventType = !eventTypeFilter || event.EventTypeID === eventTypeFilter;

    // DEBUG: Chi tiết so sánh StudentID
    if (selectedStudentId) {
      console.log(`🔍 [FILTER DETAIL] Checking event ${event.MedicalEventID}:`);
      console.log(`  - Event StudentID: "${event.StudentID}" (type: ${typeof event.StudentID})`);
      console.log(`  - Selected StudentID: "${selectedStudentId}" (type: ${typeof selectedStudentId})`);
      console.log(`  - String comparison: "${String(event.StudentID)}" === "${String(selectedStudentId)}"`);
      console.log(`  - Direct comparison: ${event.StudentID === selectedStudentId}`);
      console.log(`  - String comparison result: ${String(event.StudentID) === String(selectedStudentId)}`);
    }

    // Sử dụng String() để đảm bảo so sánh đúng kiểu dữ liệu
    const matchesStudent = !selectedStudentId || String(event.StudentID) === String(selectedStudentId);

    const result = matchesEventType && matchesStudent;

    if (selectedStudentId) {
      console.log(`  - Final match result: ${result}`);
    }

    return result;
  });

  // DEBUG: Log filter results
  console.log('🔍 [FILTER DEBUG] Medical events before filter:', medicalEvents.length);
  console.log('🔍 [FILTER DEBUG] Available StudentIDs in events:', medicalEvents.map(e => e.StudentID));
  console.log('🔍 [FILTER DEBUG] Available StudentIDs in students:', students.map(s => s.StudentID));
  console.log('🔍 [FILTER DEBUG] Filtered events count:', filteredEvents.length);
  console.log('🔍 [FILTER DEBUG] Event type filter:', eventTypeFilter);
  console.log('🔍 [FILTER DEBUG] Student filter:', selectedStudentId);
  console.log('🔍 [FILTER DEBUG] Filtered results:', filteredEvents);

  // Table columns configuration
  const columns = [
    {
      title: 'Mã sự kiện',
      dataIndex: 'MedicalEventID',
      key: 'MedicalEventID',
      width: 120,
      render: (text) => (
        <Text strong style={{ color: '#1890ff', fontSize: '12px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Học sinh',
      key: 'student',
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: '14px' }}>
            {record.StudentName}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.StudentID} - Lớp {record.StudentClass}
          </Text>
        </div>
      ),
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'EventTypeID',
      key: 'EventTypeID',
      width: 120,
      render: (eventType) => (
        <Tag color={getEventTypeColor(eventType)}>
          {eventType}
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'EventDateTime',
      key: 'EventDateTime',
      width: 150,
      render: (datetime) => (
        <div style={{ fontSize: '12px' }}>
          <div>{dayjs(datetime).format('DD/MM/YYYY')}</div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {dayjs(datetime).format('HH:mm')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'Description',
      key: 'Description',
      ellipsis: true,
      render: (text) => (
        <Text style={{ fontSize: '12px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record)}
          style={{ padding: '0 4px', fontSize: '12px' }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '0px', background: "linear-gradient(135deg, rgb(248, 250, 252) 0%, rgb(226, 232, 240) 50%, rgb(241,245,249) 100%)" }}>
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
            <span style={{ fontSize: 44, filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.13))" }}>🏥</span>
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
              Sự kiện y tế của con
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
              boxShadow: "0 2px 8px rgba(127,90,240,0.09)"
            }}
          >
            <div style={{
              fontSize: 26,
              marginBottom: 4,
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.2))",
            }}>
              <span role="img" aria-label="medical">📋</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{medicalEvents.length}</div>
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
              boxShadow: "0 2px 8px rgba(127,90,240,0.09)"
            }}
          >
            <div style={{
              fontSize: 26,
              marginBottom: 4,
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.2))",
            }}>
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

        {/* Summary Cards */}
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
                      fontSize: 32,
                      marginBottom: 8,
                      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))",
                      transform: "perspective(100px) rotateX(10deg)",
                    }}>📋</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>
                      {filteredEvents.length}
                      {console.log('🎯 [SUMMARY] Filtered events count:', filteredEvents.length)}
                    </div>
                    <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>Tổng sự kiện</div>
                  </div>
                </Col>

                {/* Tai nạn */}
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
                      fontSize: 32,
                      marginBottom: 8,
                      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))",
                      transform: "perspective(100px) rotateX(10deg)",
                    }}>⚠️</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>
                      {filteredEvents.filter(e => e.EventTypeID === 'Tai nạn' || e.EventTypeID === 'Chấn thương').length}
                    </div>
                    <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>Tai nạn</div>
                  </div>
                </Col>

                {/* Cấp cứu */}
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
                      fontSize: 32,
                      marginBottom: 8,
                      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))",
                      transform: "perspective(100px) rotateX(10deg)",
                    }}>🚑</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>
                      {filteredEvents.filter(e => e.EventTypeID === 'Cấp cứu' || e.EventTypeID === 'Khẩn cấp').length}
                    </div>
                    <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>Cấp cứu</div>
                  </div>
                </Col>

                {/* Chấn thương */}
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
                      fontSize: 32,
                      marginBottom: 8,
                      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))",
                      transform: "perspective(100px) rotateX(10deg)",
                    }}>🤕</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>
                      {filteredEvents.filter(e => e.EventTypeID === 'Chấn thương').length}
                    </div>
                    <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>Chấn thương</div>
                  </div>
                </Col>

                {/* Bệnh tật */}
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
                      fontSize: 32,
                      marginBottom: 8,
                      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))",
                      transform: "perspective(100px) rotateX(10deg)",
                    }}>🤒</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>
                      {filteredEvents.filter(e => e.EventTypeID === 'Sốt' || e.EventTypeID === 'Đau đầu' || e.EventTypeID === 'Bệnh tật').length}
                    </div>
                    <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>Bệnh tật</div>
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
            style={{ marginBottom: '16px' }}
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
            marginBottom: '16px',
            borderRadius: 16,
            border: "none",
            boxShadow: "0 4px 16px rgba(127,90,240,0.08), 0 0 0 1px #f3f4f6",
          }}
          bodyStyle={{ padding: "20px 24px" }}
        >
          <Row gutter={16} align="middle" justify="center">
            <Col xs={24} sm={10}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 18, color: "#e11d48" }}>🔄</span>
                <span style={{ fontWeight: 600, color: "#334155" }}>Trạng thái</span>
              </div>
              <Select
                placeholder="Chọn trạng thái sự kiện"
                value={eventTypeFilter}
                onChange={setEventTypeFilter}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="Tai nạn"> Tai nạn</Option>
                <Option value="Cấp cứu"> Cấp cứu</Option>
                <Option value="Chấn thương"> Chấn thương</Option>
                <Option value="Bệnh tật">Bệnh tật</Option>
              </Select>
            </Col>
            <Col xs={24} sm={10}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 18, color: "#0ea5e9" }}>🎓</span>
                <span style={{ fontWeight: 600, color: "#334155" }}>Học sinh</span>
              </div>
              <Select
                placeholder="Chọn học sinh"
                value={selectedStudentId}
                onChange={(value) => {
                  console.log('🔄 [SELECT CHANGE] Student selection changed:');
                  console.log(`  - New selected value: "${value}" (type: ${typeof value})`);
                  console.log(`  - Previous value: "${selectedStudentId}"`);
                  console.log('🔄 [SELECT] Available students:', students);
                  console.log('🔄 [SELECT] Available medical events:', medicalEvents);
                  console.log('🔄 [SELECT] StudentIDs in events:', medicalEvents.map(e => e.StudentID));
                  setSelectedStudentId(value);
                }}
                allowClear
                style={{ width: '100%' }}
                loading={studentsLoading}
              >
                {students.map(student => {
                  console.log('🔍 [SELECT OPTION] Rendering student option:', student);
                  return (
                    <Option key={student.StudentID} value={student.StudentID}>
                      {student.StudentName} - Lớp {student.Class}
                    </Option>
                  );
                })}
              </Select>
            </Col>
            <Col xs={24} sm={4}>
            </Col>
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
                <span style={{ fontSize: 18, fontWeight: 600, color: "#1e293b" }}>Danh sách sự kiện y tế</span>
                <Text className="text-sm text-gray-500" style={{ display: "flex", marginTop: 2 }}>
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
              pageSizeOptions: ['10', '20', '50'],
            }}
            locale={{
              emptyText: loading ? 'Đang tải...' : (
                <div className="text-center py-8">
                  <div style={{ fontSize: 64, marginBottom: 16 }}>🏥</div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: "#6b7280", marginBottom: 8 }}>
                    Chưa có sự kiện y tế nào
                  </div>
                  <div style={{ fontSize: 14, color: "#9ca3af" }}>
                    {medicalEvents.length === 0 ?
                      'Hiện tại chưa có sự kiện y tế nào được ghi nhận' :
                      'Không tìm thấy sự kiện phù hợp với bộ lọc'
                    }
                  </div>
                </div>
              )
            }}
            scroll={{ x: 800 }}
            bordered
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <HistoryOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <span style={{ fontWeight: 700, fontSize: '16px' }}>Chi tiết sự kiện y tế</span>
            </div>
          }
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setIsDetailModalVisible(false)}
              style={{ borderRadius: '6px', fontWeight: 500 }}
            >
              Đóng
            </Button>
          ]}
          width={800}
          bodyStyle={{ padding: '20px 24px' }}
          style={{ top: 20 }}
        >
          {selectedEvent && (
            <div>
              {/* Thông tin cơ bản */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '8px',
                  marginBottom: '16px'
                }}>
                  <Text strong style={{ fontSize: '15px', color: '#374151' }}>
                    Thông tin cơ bản
                  </Text>
                </div>

                <Row gutter={[24, 16]}>
                  {/* Cột bên trái */}
                  <Col span={12}>
                    {/* Mã sự kiện */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Mã sự kiện</Text>
                      </div>
                      <div>
                        <Text strong style={{ fontSize: '15px' }}>{selectedEvent.MedicalEventID}</Text>
                      </div>
                    </div>

                    {/* Loại sự kiện - đã tách riêng */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Loại sự kiện</Text>
                      </div>
                      <div>
                        <Tag color={getEventTypeColor(selectedEvent.EventTypeID)}
                          style={{ padding: '4px 12px', fontSize: '13px', fontWeight: 500 }}>
                          {selectedEvent.EventTypeID}
                        </Tag>
                      </div>
                    </div>

                    {/* Y tá phụ trách */}
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Y tá phụ trách</Text>
                      </div>
                      <div>
                        {selectedEvent.NurseID ? (
                          <Text strong style={{ fontSize: '15px' }}>{selectedEvent.NurseID}</Text>
                        ) : (
                          <Text style={{ fontSize: '15px', color: '#d97706' }}>Chưa xác định</Text>
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Cột bên phải */}
                  <Col span={12}>
                    {/* Học sinh */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Học sinh</Text>
                      </div>
                      <div>
                        <Text strong style={{ fontSize: '15px', display: 'flex' }}>
                          {selectedEvent.StudentName}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          {selectedEvent.StudentID} - Lớp {selectedEvent.StudentClass}
                        </Text>
                      </div>
                    </div>

                    {/* Thời gian */}
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Thời gian</Text>
                      </div>
                      <div>
                        <Text strong style={{ fontSize: '15px', display: 'flex' }}>
                          {dayjs(selectedEvent.EventDateTime).format('DD/MM/YYYY HH:mm')}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          {dayjs(selectedEvent.EventDateTime).fromNow()}
                        </Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Chi tiết sự kiện */}
              <div>
                <div style={{
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '8px',
                  marginBottom: '16px'
                }}>
                  <Text strong style={{ fontSize: '15px', color: '#374151' }}>
                    Chi tiết sự kiện
                  </Text>
                </div>

                {/* Mô tả */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ marginBottom: '8px' }}>
                     <Text type="secondary" style={{ fontSize: '14px' }}>Mô tả sự kiện</Text>
                  </div>
                  <div style={{
                    background: '#f9fafb',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    border: '1px solid #f3f4f6'
                  }}>
                    <Text style={{ fontSize: '14px', lineHeight: 1.5 }}>
                      {selectedEvent.Description}
                    </Text>
                  </div>
                </div>

                {/* Xử lý */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ marginBottom: '8px' }}>
                   <Text type="secondary" style={{ fontSize: '14px' }}>Xử lý đã thực hiện</Text>
                  </div>
                  <div style={{
                    background: '#f9fafb',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    border: '1px solid #f3f4f6'
                  }}>
                    <Text style={{ fontSize: '14px', lineHeight: 1.5 }}>
                      {selectedEvent.ActionTaken}
                    </Text>
                  </div>
                </div>

                {/* Ghi chú (nếu có) */}
                {selectedEvent.Notes && (
                  <div>
                    <div style={{ marginBottom: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '14px' }}>Ghi chú</Text>
                    </div>
                    <div style={{
                      background: '#f9fafb',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      border: '1px solid #f3f4f6'
                    }}>
                      <Text style={{ fontSize: '14px', lineHeight: 1.5 }}>
                        {selectedEvent.Notes}
                      </Text>
                    </div>
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

export default MedicalEvent;