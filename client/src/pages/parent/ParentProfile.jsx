import React, { useState, useEffect } from 'react';
import { Typography, Card, Avatar, Spin, message } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  IdcardOutlined,
  TeamOutlined,
  MailOutlined
} from '@ant-design/icons';
import healthCheckApi from '../../api/healthCheckApi';

const { Title, Text } = Typography;

const ParentProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data from API
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Đang lấy thông tin người dùng hiện tại...');

      const response = await healthCheckApi.parent.getCurrentUserInfo();
      console.log('✅ API getCurrentUserInfo response:', response);

      const user = response.data?.user || response.data;

      if (user) {
        // Chuẩn hóa dữ liệu từ API theo đúng Model backend
        const processedUser = {
          UserID: user.userID || user.UserID,
          UserName: user.userName || user.UserName,
          Name: user.name || user.Name, // Họ và tên thật
          Email: user.email || user.Email,
          Phone: user.phone || user.Phone,
          IsActive: user.isActive || user.IsActive,
          RoleID: user.roleID || user.RoleID,
          RoleName: user.roleName || user.RoleName || 'Phụ huynh'
        };

        console.log('📋 Thông tin người dùng đã xử lý:', processedUser);
        setUserData(processedUser);

        console.log(`✅ Đã tải thông tin người dùng: ${processedUser.Name || processedUser.UserName}`);
      } else {
        console.warn('⚠️ Không có dữ liệu người dùng:', response.data);
        message.warning('Không tìm thấy thông tin người dùng');
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy thông tin người dùng:', error);
      message.error('Không thể tải thông tin người dùng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Đang hoạt động' : 'Tạm khóa';
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'text-green-600' : 'text-red-600';
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

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Text type="secondary">Không có dữ liệu người dùng</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4" style={{ maxWidth: '77rem' }}>
        
        {/* Header Card */}
        <Card className="mb-6 shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-400 to-indigo-500 -mx-6 -mt-6 mb-6 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar
                    size={100}
                    icon={<UserOutlined />}
                    className="border-4 border-white shadow-lg"
                  />
                </div>
                <div className="text-white">
                  <Title level={2} className="!text-white !mb-2">
                    {userData.Name || userData.UserName}
                  </Title>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <IdcardOutlined className="text-blue-100" />
                      <Text className="text-blue-100">Mã: {userData.UserID}</Text>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TeamOutlined className="text-blue-100" />
                      <Text className="text-blue-100">Vai trò: {userData.RoleName}</Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Thông tin cá nhân */}
        <Card 
          title={
            <div className="flex items-center space-x-2">
              <UserOutlined className="text-blue-600" />
              <span className="text-gray-800 font-semibold">Thông tin cá nhân</span>
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
                value={userData.Name} 
              />
              <InfoRow 
                icon={<IdcardOutlined />}
                label="Mã người dùng" 
                value={userData.UserID} 
              />
              <InfoRow 
                icon={<TeamOutlined />}
                label="Vai trò" 
                value={userData.RoleName} 
              />
            </div>

            {/* Cột 2 - Thông tin liên hệ */}
            <div className="space-y-0 md:border-l border-gray-200">
              <InfoRow 
                icon={<MailOutlined />}
                label="Email" 
                value={userData.Email} 
              />
              <InfoRow 
                icon={<PhoneOutlined />}
                label="Số điện thoại" 
                value={userData.Phone} 
              />
              <InfoRow 
                icon={<UserOutlined />}
                label="Tên đăng nhập" 
                value={userData.UserName} 
              />
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default ParentProfile;