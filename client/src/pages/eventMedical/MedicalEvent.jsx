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
  Empty
} from 'antd';
import {
  CalendarOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  SearchOutlined,
  PhoneOutlined,
  EyeOutlined,
  DownOutlined,
  RightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const MedicalEvent = () => {
  const [medicalEvents, setMedicalEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeKeys, setActiveKeys] = useState([]);

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
      EventType: 'Đau đầu',
      NurseID: 'N001',
      Nurse: {
        FullName: 'Nguyễn Thị Hạnh',
        Phone: '0912345678'
      },
      MedicalEventDetail: [
        {
          StudentID: 'ST001'
        }
      ]
    },
    {
      MedicalEventID: 'ME2024002',
      EventDateTime: '2024-12-05T14:15:00', 
      Description: 'Con bị trầy xước đầu gối trong giờ thể dục',
      ActionTaken: 'Vệ sinh và băng bó vết thương',
      Notes: 'Vết thương không nghiêm trọng',
      EventType: 'Chấn thương',
      NurseID: 'N001',
      Nurse: {
        FullName: 'Nguyễn Thị Hạnh', 
        Phone: '0912345678'
      },
      MedicalEventDetail: [
        {
          StudentID: 'ST001'
        }
      ]
    },
    {
      MedicalEventID: 'ME2024003',
      EventDateTime: '2024-12-04T11:20:00', 
      Description: 'Con bị sốt nhẹ sau giờ ra chơi',
      ActionTaken: 'Đo nhiệt độ, cho nghỉ ngơi và thông báo phụ huynh',
      Notes: 'Nhiệt độ 37.5°C, đã liên hệ gia đình',
      EventType: 'Sốt',
      NurseID: 'N001',
      Nurse: {
        FullName: 'Nguyễn Thị Hạnh', 
        Phone: '0912345678'
      },
      MedicalEventDetail: [
        {
          StudentID: 'ST002'
        }
      ]
    }
  ];

  useEffect(() => {
    setStudents(mockStudents);
    setMedicalEvents(mockMedicalEvents);
  }, []);

  const getAge = (birthday) => {
    return dayjs().diff(dayjs(birthday), 'year');
  };

  const getEventsByStudent = (studentId) => {
    return medicalEvents.filter(event => 
      event.MedicalEventDetail.some(detail => detail.StudentID === studentId)
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="mb-2">
          <MedicineBoxOutlined className="mr-2 text-blue-500" />
          Sự kiện y tế của con
        </Title>
        <Text type="secondary">
          Theo dõi tình trạng sức khỏe của con tại trường
        </Text>
      </div>

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
                            Sinh: {dayjs(student.Birthday).format('DD/MM/YYYY')} • 
                            {getAge(student.Birthday)} tuổi • 
                            Lớp {student.Class}
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
                            {studentEvents.filter(e => e.EventType === 'Đau đầu').length}
                          </div>
                          <div className="text-xs text-gray-500">Đau đầu</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-500">
                            {studentEvents.filter(e => e.EventType === 'Chấn thương').length}
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
                                <Tag color={getEventTypeColor(event.EventType)} className="mr-2">
                                  {event.EventType}
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
                                  <Text className="text-sm">{event.Description}</Text>
                                </div>
                                <div>
                                  <Text strong className="block mb-1">Xử lý:</Text>
                                  <Text className="text-sm">{event.ActionTaken}</Text>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div className="mb-3">
                                  <Text strong className="block mb-1">Y tá:</Text>
                                  <Text className="text-sm">{event.Nurse?.FullName}</Text>
                                  <br />
                                  <Text type="secondary" className="text-xs">
                                    {event.Nurse?.Phone}
                                  </Text>
                                </div>
                                {event.Notes && (
                                  <div>
                                    <Text strong className="block mb-1">Ghi chú:</Text>
                                    <Text className="text-sm">{event.Notes}</Text>
                                  </div>
                                )}
                              </Col>
                            </Row>

                            {/* Actions */}
                            <div className="mt-3 pt-3 border-t flex justify-end">
                              <Button 
                                type="link" 
                                icon={<EyeOutlined />} 
                                size="small"
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
      {students.length === 0 && (
        <div className="text-center py-12">
          <UserOutlined className="text-6xl text-gray-300 mb-4" />
          <Title level={3} type="secondary">
            Chưa có thông tin học sinh
          </Title>
        </div>
      )}
    </div>
  );
};

export default MedicalEvent;