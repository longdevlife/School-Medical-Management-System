import React, { useState, useEffect } from 'react';
import { Typography, Card, Avatar, Spin, message, Button, Modal, Select, Tabs, Upload } from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  IdcardOutlined,
  TeamOutlined,
  GlobalOutlined,
  CameraOutlined,
  ManOutlined,
  MailOutlined
 } from '@ant-design/icons';
import studentApi from '../../api/studentApi';
import { MdMarkEmailRead, MdReportGmailerrorred } from 'react-icons/md';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const StudentProfile = () => {
  const [studentsData, setStudentsData] = useState([]); // Đổi thành array để chứa nhiều con
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState({});

  // Fetch students data from API
  useEffect(() => {
    fetchStudentsData();
  }, []);

  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Đang lấy danh sách học sinh của phụ huynh...');

      const response = await studentApi.parent.getMyChildren();
      console.log('✅ API getMyChildren response:', response);

      const studentsData = response.data || [];

      if (Array.isArray(studentsData) && studentsData.length > 0) {
        // Chuẩn hóa dữ liệu từ API theo GetStudentInfoRequest DTO
        const processedStudents = studentsData.map(student => ({
          StudentID: student.studentID || student.StudentID,
          StudentName: student.studentName || student.StudentName,
          Class: student.class || student.Class,
          StudentAvata: student.avatar || student.Avatar,
          RelationName: student.relationName || student.RelationName,
          Nationality: student.nationality || student.Nationality,
          Ethnicity: student.ethnicity || student.Ethnicity,
          Birthday: student.birthday || student.Birthday,
          Sex: student.sex || student.Sex,
          Location: student.location || student.Location,
          Parent: {
            UserName: student.parentName || student.ParentName,
            Email: student.parentEmail || student.ParentEmail,
            PhoneNumber: student.parentPhone || student.ParentPhone
          }
        }));

        console.log('📋 Danh sách học sinh đã xử lý:', processedStudents);
        setStudentsData(processedStudents);
        setSelectedStudentId(processedStudents[0]?.StudentID || '');
        setCurrentStudent(processedStudents[0] || null);

        console.log(`✅ Đã tải ${processedStudents.length} học sinh`);
      } else {
        console.warn('⚠️ Không có dữ liệu học sinh hoặc dữ liệu không hợp lệ:', studentsData);
        setStudentsData([]);
        message.warning('Không tìm thấy thông tin học sinh');
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách học sinh:', error);
      message.error('Không thể tải thông tin học sinh. Vui lòng thử lại!');
      setStudentsData([]);
    } finally {
      setLoading(false);
    }
  };

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

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    
    // Nếu đã là URL đầy đủ (bắt đầu bằng http)
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    // Nếu là đường dẫn tương đối, thêm base URL của server
    // Thay đổi URL này theo cấu hình server của bạn
    const baseUrl = 'http://localhost:5000'; // hoặc URL API server của bạn
    return `${baseUrl}/${avatarPath}`;
  };

  const handleAvatarError = (studentId) => {
    console.warn(`❌ Không thể tải avatar cho học sinh ${studentId}`);
    setAvatarLoading(prev => ({ ...prev, [studentId]: false }));
  };

  const StudentAvatar = ({ student, size = 24, className = "" }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <Avatar 
        size={size} 
        src={!imageError ? getAvatarUrl(student.StudentAvata) : null}
        icon={<UserOutlined />}
        className={className}
        onError={() => setImageError(true)}
        style={{ 
          backgroundColor: student.StudentAvata && !imageError ? 'transparent' : '#1890ff',
          border: student.StudentAvata && !imageError ? '1px solid #d9d9d9' : 'none',
          fontSize: size > 50 ? '48px' : undefined
        }}
      />
    );
  };

  const InfoRow = ({ icon, label, value, className = "" }) => (
    <div className={`flex items-center py-3 px-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${className}`}>
      <div className="flex items-center w-36 text-gray-600 font-medium text-sm">
        {icon && <span className="mr-2 text-blue-500">{icon}</span>}
        {label}
      </div>
      <div className="flex-1 text-gray-800 font-medium text-sm break-words">
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
      <div className="max-w-6xl mx-auto px-4" style={{ maxWidth: '77rem' }}>
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
                    <StudentAvatar 
                      student={student}
                      size={24}
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
            <Card className="mb-6 shadow-lg border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 -mx-6 -mt-6 mb-6 px-6 py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <StudentAvatar 
                        student={currentStudent}
                        size={100}
                        className="border-4 border-white shadow-lg"
                      />
                    </div>
                    <div className="text-white">
                      <Title level={2} className="!text-white !mb-2">
                        {currentStudent.StudentName}
                      </Title>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <IdcardOutlined className="text-blue-100" />
                          <Text className="text-blue-100">Mã HS: {currentStudent.StudentID}</Text>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TeamOutlined className="text-blue-100" />
                          <Text className="text-blue-100">Lớp: {currentStudent.Class}</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </Card>

            {/* Thông tin học sinh - Gộp tất cả */}
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <UserOutlined className="text-blue-600" />
                  <span className="text-gray-800 font-semibold">Thông tin học sinh</span>
                </div>
              }
              className="mb-8 shadow-lg border-0"
              headStyle={{ 
                backgroundColor: '#f0f9ff', 
                borderBottom: '2px solid #bae6fd',
                fontSize: '18px',
                fontWeight: '600'
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Cột 1 - Thông tin cá nhân */}
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
                    icon={<ManOutlined />}
                    label="Giới tính" 
                    value={currentStudent.Sex} 
                  />
                  <InfoRow 
                    icon={<GlobalOutlined />}
                    label="Quốc tịch" 
                    value={currentStudent.Nationality} 
                  />
                </div>

                {/* Cột 2 - Thông tin phụ huynh */}
                <div className="space-y-0 md:border-l border-gray-200">
                  <InfoRow 
                    icon={<UserOutlined />}
                    label="Họ tên cha mẹ" 
                    value={currentStudent.Parent?.UserName || currentStudent.RelationName} 
                  />
                  <InfoRow 
                    icon={<TeamOutlined />}
                    label="Mối quan hệ" 
                    value={currentStudent.RelationName} 
                  />
                  <InfoRow 
                    icon={<PhoneOutlined />}
                    label="Số điện thoại" 
                    value={currentStudent.Parent?.PhoneNumber} 
                  />
                  <InfoRow
                    icon={<MailOutlined />} 
                    label="Email cha mẹ" 
                    value={currentStudent.Parent?.Email} 
                  />
                  <InfoRow 
                    icon={<EnvironmentOutlined />}
                    label="Địa chỉ" 
                    value={currentStudent.Location}
                  />
                   <InfoRow 
                    icon={<GlobalOutlined />}
                    label="Dân tộc" 
                    value={currentStudent.Ethnicity} 
                  />
                </div>
              </div>
            </Card>

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