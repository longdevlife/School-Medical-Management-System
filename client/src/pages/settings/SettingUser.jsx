import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  message,
  Space,
  Avatar,
  Divider,
  Spin,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { getUserInfo, updateCurrentUserInfo, changePassword } from "../../api/settingsApi";

const { Title, Text } = Typography;

function SettingUser() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [forceRender, setForceRender] = useState(0);
  const isEditingRef = useRef(false);

  // Get current user info
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching current user info...');
      
      const response = await getUserInfo();
      console.log('✅ User info response:', response.data);
      
      // API trả về {user: {...}, message: '...'} nên cần lấy response.data.user
      const userData = response.data.user;
      setUserInfo(userData);
      
      // Populate form with user data từ userData object
      form.setFieldsValue({
        userName: userData.userName || '',
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        password: '' // Always empty for security
      });
      
    } catch (error) {
      console.error('❌ Error fetching user info:', error);
      message.error('Không thể tải thông tin người dùng!');
    } finally {
      setLoading(false);
    }
  };

  // Update user info
  const updateUserInfo = async (values) => {
    try {
      setLoading(true);
      console.log('📤 Updating user info with values:', values);
      console.log('📤 Current userInfo for comparison:', userInfo);
      
      // Debug: log field by field comparison
      console.log('🔍 Field comparisons:');
      console.log('  userName:', `"${values.userName}" vs "${userInfo.userName}"`, values.userName !== userInfo.userName);
      console.log('  name:', `"${values.name}" vs "${userInfo.name}"`, values.name !== userInfo.name);
      console.log('  email:', `"${values.email}" vs "${userInfo.email}"`, values.email !== userInfo.email);
      console.log('  phone:', `"${values.phone}" vs "${userInfo.phone}"`, values.phone !== userInfo.phone);
      console.log('  password:', `"${values.password}"`, values.password && values.password.trim() !== '');
      
      // Prepare payload - only include CHANGED fields
      const payload = {};
      
      // Only include changed fields
      if (values.userName !== userInfo.userName) {
        payload.userName = values.userName.trim();
      }
      
      if (values.name !== userInfo.name) {
        payload.name = values.name.trim();
      }
      
      if (values.email !== userInfo.email) {
        payload.email = values.email.trim();
      }
      
      if (values.phone !== userInfo.phone) {
        payload.phone = values.phone ? values.phone.trim() : '';
      }
      
      // Password is always optional and only sent if provided
      if (values.password && values.password.trim() !== '') {
        payload.password = values.password.trim();
      }
      
      console.log('📤 Update payload (only changed fields):', payload);
      console.log('📤 Payload keys count:', Object.keys(payload).length);
      
      if (Object.keys(payload).length === 0) {
        message.warning('Không có thay đổi nào để cập nhật!');
        setIsEditing(false);
        return;
      }
      
      console.log('📤 Calling updateCurrentUserInfo API...');
      const response = await updateCurrentUserInfo(payload);
      console.log('✅ Update user info API response:', response);
      console.log('✅ Update response data:', response.data);
      
      message.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
      
      // Refresh user info
      console.log('🔄 Refreshing user info after update...');
      await fetchUserInfo();
      
    } catch (error) {
      console.error('❌ Error updating user info:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      
      let errorMessage = 'Cập nhật thông tin thất bại!';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.title) {
        errorMessage = error.response.data.title;
      } else if (error.response?.status === 400) {
        errorMessage = 'Dữ liệu không hợp lệ!';
      } else if (error.response?.status === 401) {
        errorMessage = 'Bạn không có quyền thực hiện thao tác này!';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy API endpoint!';
      } else if (error.message) {
        errorMessage = `Lỗi: ${error.message}`;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle password change - Simplified logging
  const handlePasswordChange = async (values) => {
    console.log('🎯 handlePasswordChange function called with values:', {
      oldPassword: values.oldPassword ? `***${values.oldPassword.length} chars***` : 'MISSING',
      newPassword: values.newPassword ? `***${values.newPassword.length} chars***` : 'MISSING',
      confirmPassword: values.confirmPassword ? `***${values.confirmPassword.length} chars***` : 'MISSING'
    });
    
    try {
      setLoading(true);
      console.log('🔐 Starting password change...');
      console.log('🔐 setLoading(true) completed');
      
      const passwordData = {
        oldPass: values.oldPassword,
        newPass: values.newPassword
      };
      
      console.log('🔐 Password data prepared:', {
        oldPass: passwordData.oldPass ? `***${passwordData.oldPass.length} chars***` : 'MISSING',
        newPass: passwordData.newPass ? `***${passwordData.newPass.length} chars***` : 'MISSING'
      });
      
      console.log('🔐 About to call changePassword API...');
      console.log('🔐 changePassword function exists?', typeof changePassword);
      
      const response = await changePassword(passwordData);
      
      console.log('✅ Password changed successfully!');
      console.log('✅ Response:', response.data);
      
      message.success('Đổi mật khẩu thành công!');
      setIsChangingPassword(false);
      passwordForm.resetFields();
      
      // Refresh user info to verify password hash changed
      console.log('🔄 Refreshing user info to verify change...');
      await fetchUserInfo();
      
    } catch (error) {
      console.error('❌ Password change failed:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      
      let errorMessage = 'Đổi mật khẩu thất bại!';
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Mật khẩu cũ không đúng hoặc mật khẩu mới không hợp lệ!';
      } else if (error.response?.status === 401) {
        errorMessage = 'Mật khẩu cũ không đúng!';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      message.error(errorMessage);
    } finally {
      console.log('🔄 Setting loading to false...');
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateUserInfo(values);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      console.log('🚀 handlePasswordSubmit called');
      const values = await passwordForm.validateFields();
      console.log('✅ Password form validation passed');
      console.log('📋 Form values:', {
        oldPassword: values.oldPassword ? `***${values.oldPassword.length} chars***` : 'EMPTY',
        newPassword: values.newPassword ? `***${values.newPassword.length} chars***` : 'EMPTY',
        confirmPassword: values.confirmPassword ? `***${values.confirmPassword.length} chars***` : 'EMPTY'
      });
      await handlePasswordChange(values);
    } catch (error) {
      console.error('❌ Password form validation error:', error);
      console.error('❌ Validation details:', error.errorFields);
    }
  };

  const handleEditClick = useCallback(() => {
    console.log('📝 Edit button clicked, setting isEditing to true');
    console.log('📝 Current isEditing state:', isEditing);
    console.log('📝 Current isEditingRef.current:', isEditingRef.current);
    
    // Update both state and ref
    setIsEditing(true);
    isEditingRef.current = true;
    
    // Force component re-render
    setForceRender(prev => prev + 1);
    
    console.log('📝 After setting - isEditingRef.current:', isEditingRef.current);
    console.log('📝 Force render counter:', forceRender + 1);
  }, [isEditing, forceRender]);

  const handleCancel = useCallback(() => {
    console.log('❌ Cancel button clicked, resetting form and setting isEditing to false');
    // Reset form to original values
    form.setFieldsValue({
      userName: userInfo.userName || '',
      name: userInfo.name || '',
      email: userInfo.email || '',
      phone: userInfo.phone || '',
      password: ''
    });
    setIsEditing(false);
    isEditingRef.current = false;
    setForceRender(prev => prev + 1);
  }, [form, userInfo]);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <div className="p-0 sm:p-8 bg-gradient-to-br from-blue-200 via-white to-blue-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-10 flex items-center gap-8">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-400 to-blue-700 rounded-full p-6 shadow-2xl flex items-center justify-center border-4 border-white">
              <UserOutlined className="text-white text-4xl drop-shadow-xl" />
            </div>
            <span className="absolute -bottom-2 -right-2 bg-white rounded-full px-2 py-1 text-xs text-blue-700 font-bold shadow border border-blue-100">
              PROFILE
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <Title level={2} className="text-blue-900 mb-0 font-black tracking-wide drop-shadow-xl">
              Thông Tin Cá Nhân
            </Title>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 animate-pulse shadow"></span>
              <Text type="secondary" className="text-lg font-medium text-gray-600 italic">
                Xem và cập nhật thông tin tài khoản
              </Text>
            </div>
          </div>
        </div>

        <Spin spinning={loading}>
          <Card className="rounded-3xl shadow-2xl border-blue-200 bg-white/95">
            <div className="p-6">
              {/* User Avatar Section */}
              <div className="text-center mb-8">
                <Avatar 
                  size={100} 
                  icon={<UserOutlined />} 
                  className="bg-gradient-to-br from-blue-400 to-blue-600 mb-4"
                />
                <Title level={3} className="text-blue-800 mb-1">
                  {userInfo?.name || 'Người dùng'}
                </Title>
                <Text type="secondary" className="text-base">
                  {userInfo?.roleName || 'User'} • {userInfo?.userName || 'N/A'}
                </Text>
              </div>

              <Divider />

              {/* User Info Form */}
              <Form
                form={form}
                layout="vertical"
                className="space-y-4"
                onFinish={handleSubmit}
                key={`${isEditing ? 'editing' : 'viewing'}-${forceRender}`}
              >
                
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="userName"
                      label={
                        <span className="font-bold text-gray-700 flex items-center gap-2">
                          <UserOutlined /> Tên đăng nhập (Chỉ xem - Không thể thay đổi) 🔒
                        </span>
                      }
                      rules={[
                        { required: true, message: "Vui lòng nhập tên đăng nhập" },
                        { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự" }
                      ]}
                    >
                      <Input 
                        className="rounded-xl text-base py-2 bg-gray-100 border-gray-300 cursor-not-allowed"
                        placeholder="Tên đăng nhập không thể thay đổi"
                        disabled={true}
                        readOnly={true}
                        style={{
                          backgroundColor: '#f3f4f6',
                          borderColor: '#d1d5db',
                          cursor: 'not-allowed',
                          color: '#6b7280'
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label={
                        <span className="font-bold text-gray-700 flex items-center gap-2">
                          <UserOutlined /> Họ và tên {(isEditing || isEditingRef.current) ? '(Có thể chỉnh sửa) ✅' : '(Chỉ xem) ❌'}
                        </span>
                      }
                      rules={[
                        { required: true, message: "Vui lòng nhập họ và tên" },
                        { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự" }
                      ]}
                    >
                      <Input 
                        className={`rounded-xl text-base py-2 transition-all duration-300 ${
                          (isEditing || isEditingRef.current)
                            ? 'border-blue-400 bg-white hover:border-blue-500 focus:border-blue-600 focus:shadow-lg' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        placeholder={(isEditing || isEditingRef.current) ? "Nhập họ và tên" : "Chỉ xem (disabled)"}
                        disabled={!isEditing && !isEditingRef.current}
                        readOnly={!isEditing && !isEditingRef.current}
                        style={{
                          backgroundColor: (isEditing || isEditingRef.current) ? 'white' : '#f5f5f5',
                          borderColor: (isEditing || isEditingRef.current) ? '#60a5fa' : '#d1d5db',
                          cursor: (isEditing || isEditingRef.current) ? 'text' : 'not-allowed'
                        }}
                        onFocus={() => console.log('🎯 name input focused - isEditing:', isEditing, 'isEditingRef:', isEditingRef.current)}
                        onChange={(e) => console.log('📝 name changed:', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label={
                        <span className="font-bold text-gray-700 flex items-center gap-2">
                          <MailOutlined /> Email {(isEditing || isEditingRef.current) ? '(Có thể chỉnh sửa) ✅' : '(Chỉ xem) ❌'}
                        </span>
                      }
                      rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: 'email', message: 'Email không hợp lệ' }
                      ]}
                    >
                      <Input 
                        className={`rounded-xl text-base py-2 transition-all duration-300 ${
                          (isEditing || isEditingRef.current)
                            ? 'border-blue-400 bg-white hover:border-blue-500 focus:border-blue-600 focus:shadow-lg' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        placeholder={(isEditing || isEditingRef.current) ? "Nhập địa chỉ email" : "Chỉ xem (disabled)"}
                        disabled={!isEditing && !isEditingRef.current}
                        readOnly={!isEditing && !isEditingRef.current}
                        style={{
                          backgroundColor: (isEditing || isEditingRef.current) ? 'white' : '#f5f5f5',
                          borderColor: (isEditing || isEditingRef.current) ? '#60a5fa' : '#d1d5db',
                          cursor: (isEditing || isEditingRef.current) ? 'text' : 'not-allowed'
                        }}
                        onFocus={() => console.log('🎯 email input focused - isEditing:', isEditing, 'isEditingRef:', isEditingRef.current)}
                        onChange={(e) => console.log('📝 email changed:', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label={
                        <span className="font-bold text-gray-700 flex items-center gap-2">
                          <PhoneOutlined /> Số điện thoại {(isEditing || isEditingRef.current) ? '(Có thể chỉnh sửa) ✅' : '(Chỉ xem) ❌'}
                        </span>
                      }
                      rules={[
                        { pattern: /^[0-9+\-\s()]+$/, message: "Số điện thoại không hợp lệ" }
                      ]}
                    >
                      <Input 
                        className={`rounded-xl text-base py-2 transition-all duration-300 ${
                          (isEditing || isEditingRef.current)
                            ? 'border-blue-400 bg-white hover:border-blue-500 focus:border-blue-600 focus:shadow-lg' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        placeholder={(isEditing || isEditingRef.current) ? "Nhập số điện thoại" : "Chỉ xem (disabled)"}
                        disabled={!isEditing && !isEditingRef.current}
                        readOnly={!isEditing && !isEditingRef.current}
                        style={{
                          backgroundColor: (isEditing || isEditingRef.current) ? 'white' : '#f5f5f5',
                          borderColor: (isEditing || isEditingRef.current) ? '#60a5fa' : '#d1d5db',
                          cursor: (isEditing || isEditingRef.current) ? 'text' : 'not-allowed'
                        }}
                        onFocus={() => console.log('🎯 phone input focused - isEditing:', isEditing, 'isEditingRef:', isEditingRef.current)}
                        onChange={(e) => console.log('📝 phone changed:', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>

             
                {/* Password Change Section - COMPLETELY SEPARATE */}
                {(isEditing || isEditingRef.current) && (
                  <Card className="mt-6 bg-orange-50 border border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <LockOutlined /> Thay đổi mật khẩu
                      </span>
                      <Button
                        type="link"
                        onClick={() => {
                          console.log('🔐 Toggling password change form:', !isChangingPassword);
                          setIsChangingPassword(!isChangingPassword);
                        }}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        {isChangingPassword ? 'Hủy đổi mật khẩu' : 'Đổi mật khẩu'}
                      </Button>
                    </div>
                    
                    {isChangingPassword && (
                      <div className="p-4 bg-white rounded-lg border border-orange-300">
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm text-blue-800">
                            <strong>🔒 Bảo mật:</strong> Bạn cần nhập đúng mật khẩu hiện tại để có thể đổi mật khẩu mới.
                          </div>
                        </div>
                        
                        <Form
                          form={passwordForm}
                          layout="vertical"
                          onFinish={handlePasswordSubmit}
                        >
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name="oldPassword"
                                label={
                                  <span className="font-bold text-red-600">
                                    🔑 Mật khẩu hiện tại (bắt buộc đúng)
                                  </span>
                                }
                                rules={[
                                  { required: true, message: "Vui lòng nhập mật khẩu hiện tại" }
                                ]}
                              >
                                <Input.Password 
                                  className="rounded-xl" 
                                  placeholder="Nhập mật khẩu hiện tại của bạn"
                                  autoComplete="current-password"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="newPassword"
                                label={
                                  <span className="font-bold text-green-600">
                                    🆕 Mật khẩu mới
                                  </span>
                                }
                                rules={[
                                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                                  { min: 6, message: "Mật khẩu mới phải có ít nhất 6 ký tự" }
                                ]}
                              >
                                <Input.Password 
                                  className="rounded-xl" 
                                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                  autoComplete="new-password"
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          
                          <Form.Item
                            name="confirmPassword"
                            label={
                              <span className="font-bold text-green-600">
                                ✅ Xác nhận mật khẩu mới
                              </span>
                            }
                            dependencies={['newPassword']}
                            rules={[
                              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                              }),
                            ]}
                          >
                            <Input.Password 
                              className="rounded-xl" 
                              placeholder="Nhập lại mật khẩu mới để xác nhận"
                              autoComplete="new-password"
                            />
                          </Form.Item>
                          
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => {
                                console.log('🔐 Cancelling password change');
                                setIsChangingPassword(false);
                                passwordForm.resetFields();
                              }}
                              className="rounded-xl"
                            >
                              Hủy
                            </Button>
                            <Button
                              type="primary"
                              onClick={handlePasswordSubmit}
                              loading={loading}
                              className="rounded-xl bg-orange-500 hover:bg-orange-600"
                            >
                              🔐 Đổi mật khẩu
                            </Button>
                          </div>
                        </Form>
                      </div>
                    )}
                  </Card>
                )}

                {/* Action Buttons - Moved outside main form */}
                <div className="flex justify-center gap-4 mt-8">
                  {(!isEditing && !isEditingRef.current) ? (
                    <Space size="large">
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEditClick}
                        className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 font-bold px-8 py-2 text-base h-auto"
                        size="large"
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchUserInfo}
                        className="rounded-xl font-bold px-6 py-2 text-base h-auto"
                        size="large"
                      >
                        Làm mới
                      </Button>
                    </Space>
                  ) : (
                    <Space size="large">
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSubmit}
                        loading={loading && !isChangingPassword}
                        className="rounded-xl bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 font-bold px-8 py-2 text-base h-auto"
                        size="large"
                      >
                        Lưu thay đổi
                      </Button>
                      <Button
                        onClick={handleCancel}
                        className="rounded-xl font-bold px-6 py-2 text-base h-auto"
                        size="large"
                      >
                        Hủy
                      </Button>
                    </Space>
                  )}
                </div>
              </Form>
            </div>
          </Card>
        </Spin>
      </div>
    </div>
  );
}

// Đảm bảo export đúng tên
export default SettingUser;


