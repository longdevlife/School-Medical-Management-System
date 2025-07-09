import React, { useState, useEffect } from 'react';
import { Typography, Card, Avatar, Spin, message, Button, Modal, Select, Tabs } from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  IdcardOutlined,
  TeamOutlined,
  GlobalOutlined,
 } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const StudentProfile = () => {
  const [studentsData, setStudentsData] = useState([]); // Đổi thành array để chứa nhiều con
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Mock data - thay thế bằng API call thực tế
  useEffect(() => {
    // Giả lập API call để lấy danh sách con của phụ huynh
    setLoading(true);
    setTimeout(() => {
      const studentsData = [
        {
          StudentID: "ST001",
          StudentName: "Lê Văn Bình",
          Class: "2E",
          StudentAvata: null,
          RelationName: "Nguyễn Thị Hạnh",
          Nationality: "Việt Nam",
          Ethnicity: "Kinh",
          Birthday: "2018-09-22T00:00:00",
          Sex: "Nam",
          Location: "Liên Phường, Quận 9, TP Thủ Đức, TP Hồ Chí Minh",
          Parent: {
            UserName: "Nguyễn Thị Hạnh",
            Email: "nguyenthihanh@gmail.com",
            PhoneNumber: "0836438321"
          }
        },
        {
          StudentID: "ST002",
          StudentName: "Lê Thị Cẩm Ly",
          Class: "4A",
          StudentAvata: null,
          RelationName: "Nguyễn Thị Hạnh",
          Nationality: "Việt Nam",
          Ethnicity: "Kinh",
          Birthday: "2016-03-15T00:00:00",
          Sex: "Nữ",
          Location: "Liên Phường, Quận 9, TP Thủ Đức, TP Hồ Chí Minh",
          Parent: {
            UserName: "Nguyễn Thị Hạnh",
            Email: "nguyenthihanh@gmail.com",
            PhoneNumber: "0836438321"
          }
        }
      ];
      
      setStudentsData(studentsData);
      setSelectedStudentId(studentsData[0]?.StudentID || '');
      setCurrentStudent(studentsData[0] || null);
      setLoading(false);
    }, 1000);
  }, []);

  // Xử lý khi chọn học sinh khác
  const handleStudentChange = (studentId) => {
    const student = studentsData.find(s => s.StudentID === studentId);
    setSelectedStudentId(studentId);
    setCurrentStudent(student);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const InfoRow = ({ icon, label, value, className = "" }) => (
    <div className={`flex items-center py-4 px-6 border-b border-gray-200 hover:bg-gray-50 transition-colors ${className}`}>
      <div className="flex items-center w-48 text-gray-600 font-medium">
        {icon && <span className="mr-3 text-blue-500">{icon}</span>}
        {label}
      </div>
      <div className="flex-1 text-gray-800 font-medium">
        {value || 'Chưa cập nhật'}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!studentsData.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Text type="secondary">Không có dữ liệu học sinh</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Tabs cho multiple children - Alternative approach */}
        <Card className="mb-6 shadow-lg border-0">
          <Tabs 
            activeKey={selectedStudentId}
            onChange={handleStudentChange}
            type="card"
            size="large"
          >
            {studentsData.map(student => (
              <TabPane
                key={student.StudentID}
                tab={
                  <div className="flex items-center">
                    <Avatar 
                      size={24} 
                      src={student.StudentAvata} 
                      icon={<UserOutlined />}
                      className="mr-2"
                    />
                    <span>{student.StudentName}</span>
                    <span className="text-gray-500 ml-1 text-sm">({student.Class})</span>
                  </div>
                }
              />
            ))}
          </Tabs>
        </Card>

        {/* Student Profile Content */}
        {currentStudent && (
          <>
            {/* Header Card */}
            <Card className="mb-8 shadow-lg border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-700 -mx-6 -mt-6 mb-6 px-6 py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <Avatar
                      size={120}
                      src={currentStudent.StudentAvata}
                      icon={<UserOutlined />}
                      className="border-4 border-white shadow-lg"
                    />
                    <div className="text-white">
                      <Title level={2} className="!text-white !mb-2">
                        {currentStudent.StudentName}
                      </Title>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <IdcardOutlined />
                          <Text className="text-blue-100">Mã HS: {currentStudent.StudentID}</Text>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TeamOutlined />
                          <Text className="text-blue-100">Lớp: {currentStudent.Class}</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Thông tin cá nhân */}
              <Card 
                title={
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-blue-500" />
                    <span>Thông tin cá nhân</span>
                  </div>
                }
                className="shadow-lg border-0"
                headStyle={{ 
                  backgroundColor: '#f8fafc', 
                  borderBottom: '2px solid #e2e8f0',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <div className="space-y-0">
                  <InfoRow 
                    icon={<UserOutlined />}
                    label="Họ và tên" 
                    value={currentStudent.StudentName} 
                  />
                  <InfoRow 
                    icon={<IdcardOutlined />}
                    label="Mã học sinh" 
                    value={currentStudent.StudentID} 
                  />
                  <InfoRow 
                    icon={<TeamOutlined />}
                    label="Lớp" 
                    value={currentStudent.Class} 
                  />
                  <InfoRow 
                    icon={<CalendarOutlined />}
                    label="Ngày sinh" 
                    value={formatDate(currentStudent.Birthday)} 
                  />
                  <InfoRow 
                    label="Giới tính" 
                    value={currentStudent.Sex} 
                    className="border-b-0"
                  />
                </div>
              </Card>

              {/* Thông tin gia đình */}
              <Card 
                title={
                  <div className="flex items-center space-x-2">
                    <TeamOutlined className="text-green-500" />
                    <span>Thông tin gia đình</span>
                  </div>
                }
                className="shadow-lg border-0"
                headStyle={{ 
                  backgroundColor: '#f8fafc', 
                  borderBottom: '2px solid #e2e8f0',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <div className="space-y-0">
                  <InfoRow 
                    icon={<UserOutlined />}
                    label="Họ tên phụ huynh" 
                    value={currentStudent.RelationName} 
                  />
                  <InfoRow 
                    icon={<PhoneOutlined />}
                    label="Số điện thoại" 
                    value={currentStudent.Parent?.PhoneNumber} 
                  />
                  <InfoRow 
                    label="Email" 
                    value={currentStudent.Parent?.Email} 
                  />
                  <InfoRow 
                    icon={<GlobalOutlined />}
                    label="Quốc tịch" 
                    value={currentStudent.Nationality} 
                  />
                  <InfoRow 
                    label="Dân tộc" 
                    value={currentStudent.Ethnicity} 
                    className="border-b-0"
                  />
                </div>
              </Card>
            </div>

            {/* Địa chỉ */}
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <EnvironmentOutlined className="text-red-500" />
                  <span>Địa chỉ liên hệ</span>
                </div>
              }
              className="mt-8 shadow-lg border-0"
              headStyle={{ 
                backgroundColor: '#f8fafc', 
                borderBottom: '2px solid #e2e8f0',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <div className="py-4 px-2">
                <div className="flex items-start space-x-3">
                  <EnvironmentOutlined className="text-red-500 mt-1" />
                  <Text className="text-gray-800 text-base leading-relaxed">
                    {currentStudent.Location}
                  </Text>
                </div>
              </div>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Card className="text-center shadow-md border-0 bg-gradient-to-br from-blue-500 to-blue-600">
                <div className="text-white">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-blue-100">Hồ sơ sức khỏe</div>
                </div>
              </Card>
              <Card className="text-center shadow-md border-0 bg-gradient-to-br from-green-500 to-green-600">
                <div className="text-white">
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-green-100">Lần tiêm chủng</div>
                </div>
              </Card>
              <Card className="text-center shadow-md border-0 bg-gradient-to-br from-purple-500 to-purple-600">
                <div className="text-white">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-purple-100">Khám sức khỏe</div>
                </div>
              </Card>
              <Card className="text-center shadow-md border-0 bg-gradient-to-br from-orange-500 to-orange-600">
                <div className="text-white">
                  <div className="text-2xl font-bold">2</div>
                  <div className="text-orange-100">Sự kiện y tế</div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        title={`Chỉnh sửa thông tin - ${currentStudent?.StudentName}`}
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="text-center py-8 text-gray-500">
          Tính năng chỉnh sửa sẽ được phát triển sau
        </div>
      </Modal>
    </div>
  );
};

export default StudentProfile;