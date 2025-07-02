import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Tag,
  Avatar,
  Typography,
  Row,
  Col,
  Collapse,
  Space,
  Empty,
  message,
  Spin,
  Alert
} from 'antd';
import {
  CalendarOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  SearchOutlined,
  PhoneOutlined,
  EyeOutlined,
  DownOutlined,
  RightOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import medicalEventApi from '../../api/medicalEventApi';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const MedicalEvent = () => {
  const [medicalEvents, setMedicalEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeKeys, setActiveKeys] = useState([]);

  // Hàm lấy dữ liệu sự kiện y tế từ API
  const fetchMedicalEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API để lấy dữ liệu sự kiện y tế
      const response = await medicalEventApi.parent.getMedicalEvents();
      const data = response.data;
      
      console.log('Dữ liệu sự kiện y tế từ API:', data);
      
      if (data && Array.isArray(data)) {
        setMedicalEvents(data);
        
        // Tạo danh sách học sinh duy nhất từ sự kiện y tế
        const uniqueStudents = extractUniqueStudents(data);
        setStudents(uniqueStudents);
        
        // Mở tất cả các panel mặc định nếu có ít hơn 3 học sinh
        if (uniqueStudents.length > 0 && uniqueStudents.length <= 3) {
          setActiveKeys(uniqueStudents.map(s => s.StudentID));
        }
        
        message.success(`Đã tải ${data.length} sự kiện y tế`);
      } else {
        setMedicalEvents([]);
        setStudents([]);
        message.info('Không có dữ liệu sự kiện y tế');
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sự kiện y tế:', error);
      setError('Không thể tải dữ liệu sự kiện y tế. Vui lòng thử lại sau.');
      message.error('Không thể tải dữ liệu sự kiện y tế');
      
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for development');
        setMedicalEvents(mockMedicalEvents);
        setStudents(mockStudents);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm trích xuất danh sách học sinh duy nhất từ sự kiện y tế
  const extractUniqueStudents = (events) => {
    const studentMap = new Map();
    
    events.forEach(event => {
      if (event.StudentID && Array.isArray(event.StudentID)) {
        event.StudentID.forEach(studentId => {
          if (!studentMap.has(studentId)) {
            // Tìm thông tin học sinh từ sự kiện
            const studentInfo = {
              StudentID: studentId,
              StudentName: 'Học sinh', // Mặc định nếu không có tên
              Class: 'N/A',
              Birthday: null
            };
            
            // Thêm vào map
            studentMap.set(studentId, studentInfo);
          }
        });
      }
    });
    
    return Array.from(studentMap.values());
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

  // Mock data cho medical events
  const mockMedicalEvents = [
    {
      MedicalEventID: 'ME2024001',
      EventDateTime: '2024-12-06T09:30:00',
      Description: 'Con bị đau đầu trong giờ học Toán',
      ActionTaken: 'Y tá đã cho con nghỉ ngơi và uống thuốc giảm đau',
      Notes: 'Cần theo dõi thêm nếu tình trạng tái diễn',
      EventTypeID: 'Đau đầu',
      NurseID: 'N001',
      Nurse: {
        FullName: 'Nguyễn Thị Hạnh',
        Phone: '0912345678'
      },
      StudentID: ['ST001']
    },
    {
      MedicalEventID: 'ME2024002',
      EventDateTime: '2024-12-05T14:15:00', 
      Description: 'Con bị trầy xước đầu gối trong giờ thể dục',
      ActionTaken: 'Vệ sinh và băng bó vết thương',
      Notes: 'Vết thương không nghiêm trọng',
      EventTypeID: 'Chấn thương',
      NurseID: 'N001',
      Nurse: {
        FullName: 'Nguyễn Thị Hạnh', 
        Phone: '0912345678'
      },
      StudentID: ['ST001']
    },
    {
      MedicalEventID: 'ME2024003',
      EventDateTime: '2024-12-04T11:20:00', 
      Description: 'Con bị sốt nhẹ sau giờ ra chơi',
      ActionTaken: 'Đo nhiệt độ, cho nghỉ ngơi và thông báo phụ huynh',
      Notes: 'Nhiệt độ 37.5°C, đã liên hệ gia đình',
      EventTypeID: 'Sốt',
      NurseID: 'N001',
      Nurse: {
        FullName: 'Nguyễn Thị Hạnh', 
        Phone: '0912345678'
      },
      StudentID: ['ST002']
    }
  ];

  useEffect(() => {
    fetchMedicalEvents();
  }, []);

  const getAge = (birthday) => {
    if (!birthday) return 'N/A';
    return dayjs().diff(dayjs(birthday), 'year');
  };

  const getEventsByStudent = (studentId) => {
    return medicalEvents.filter(event => 
      event.StudentID && Array.isArray(event.StudentID) && 
      event.StudentID.includes(studentId)
    );
  };

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

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải dữ liệu sự kiện y tế..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Title level={2} className="mb-2">
            <MedicineBoxOutlined className="mr-2 text-blue-500" />
            Sự kiện y tế của con
          </Title>
          <Text type="secondary">
            Theo dõi tình trạng sức khỏe của con tại trường
          </Text>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4">
          <Alert
            message="Lỗi khi tải dữ liệu"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={fetchMedicalEvents}>
                Thử lại
              </Button>
            }
          />
        </div>
      )}

      {/* Student List */}
      <div className="space-y-4">
        {students.map((student) => {
          const studentEvents = getEventsByStudent(student.StudentID);
          
          return (
            <Card key={student.StudentID} className="shadow-sm">
              <Collapse 
                ghost
                activeKey={activeKeys}
                onChange={setActiveKeys}
                expandIcon={({ isActive }) => 
                  isActive ? <DownOutlined /> : <RightOutlined />
                }
              >
                <Panel
                  key={student.StudentID}
                  header={
                    <div className="flex items-center justify-between w-full">
                      {/* Student Basic Info */}
                      <div className="flex items-center">
                        <Avatar 
                          size={50} 
                          icon={<UserOutlined />}
                          className="mr-3 bg-blue-500"
                        />
                        <div>
                          <Title level={4} className="mb-0">
                            {student.StudentName}
                          </Title>
                          <Text type="secondary" className="text-sm">
                            {student.Birthday ? (
                              <>
                                Sinh: {dayjs(student.Birthday).format('DD/MM/YYYY')} • 
                                {getAge(student.Birthday)} tuổi • 
                              </>
                            ) : null}
                            Lớp {student.Class || 'N/A'}
                          </Text>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex gap-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {studentEvents.length}
                          </div>
                          <div className="text-xs text-gray-500">Sự kiện</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-500">
                            {studentEvents.filter(e => e.EventTypeID === 'Đau đầu').length}
                          </div>
                          <div className="text-xs text-gray-500">Đau đầu</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-500">
                            {studentEvents.filter(e => e.EventTypeID === 'Chấn thương').length}
                          </div>
                          <div className="text-xs text-gray-500">Chấn thương</div>
                        </div>
                      </div>
                    </div>
                  }
                >
                  {/* Medical Events */}
                  <div className="mt-4 pt-4 border-t">
                    {studentEvents.length === 0 ? (
                      <Empty 
                        description="Chưa có sự kiện y tế nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ) : (
                      <div className="space-y-3">
                        {studentEvents.map((event) => (
                          <Card 
                            key={event.MedicalEventID}
                            size="small"
                            className="bg-gray-50"
                          >
                            {/* Event Header */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <Tag color={getEventTypeColor(event.EventTypeID)} className="mr-2">
                                  {event.EventTypeID}
                                </Tag>
                                <Text type="secondary" className="text-xs">
                                  {event.MedicalEventID}
                                </Text>
                              </div>
                              <div className="text-right">
                                <Text strong className="block">
                                  {dayjs(event.EventDateTime).format('DD/MM/YYYY')}
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {dayjs(event.EventDateTime).format('HH:mm')}
                                </Text>
                              </div>
                            </div>

                            {/* Event Content */}
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="mb-3">
                                  <Text strong className="block mb-1">Mô tả:</Text>
                                  <Text className="text-sm">{event.Description || 'Không có mô tả'}</Text>
                                </div>
                                <div>
                                  <Text strong className="block mb-1">Xử lý:</Text>
                                  <Text className="text-sm">{event.ActionTaken || 'Không có thông tin'}</Text>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div className="mb-3">
                                  <Text strong className="block mb-1">Y tá:</Text>
                                  <Text className="text-sm">{event.NurseID || 'Không có thông tin'}</Text>
                                </div>
                                {event.Notes && (
                                  <div>
                                    <Text strong className="block mb-1">Ghi chú:</Text>
                                    <Text className="text-sm">{event.Notes}</Text>
                                  </div>
                                )}
                              </Col>
                            </Row>

                            {/* Chỉ hiển thị nút xem chi tiết, không có chức năng chỉnh sửa */}
                            <div className="mt-3 pt-3 border-t flex justify-end">
                              <Button 
                                type="link" 
                                icon={<EyeOutlined />} 
                                size="small"
                                onClick={() => message.info('Chi tiết sự kiện y tế')}
                              >
                                Chi tiết
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </Panel>
              </Collapse>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {students.length === 0 && !loading && (
        <div className="text-center py-12">
          <MedicineBoxOutlined className="text-6xl text-gray-300 mb-4" />
          <Title level={3} type="secondary">
            Chưa có sự kiện y tế nào
          </Title>
          <Text type="secondary" className="mt-2 block">
            Hiện tại chưa có sự kiện y tế nào được ghi nhận cho con của bạn
          </Text>
          <Button 
            type="primary" 
            className="mt-4"
            onClick={fetchMedicalEvents}
            icon={<ReloadOutlined />}
          >
            Làm mới dữ liệu
          </Button>
        </div>
      )}
    </div>
  );
};

export default MedicalEvent;