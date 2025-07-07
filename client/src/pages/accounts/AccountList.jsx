import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  Statistic,
  Popconfirm,
  message,
  Descriptions,
  DatePicker,
  Pagination,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  createAccounts,
  updateUserInfo,
  deleteUser,
  getAllAccounts,
  getUsersFromFile,
  activeAccount,
  createStudentProfile,
} from "../../api/userApi";
import axiosClient from "../../api/axiosClient";

const { Title, Text } = Typography;
const { Option } = Select;

// Custom icon component for import functionality
const UploadIcon = () => {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 16V4m0 0l-4 4m4-4l4 4"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="4"
        y="16"
        width="16"
        height="4"
        rx="2"
        fill="#2563eb"
        fillOpacity=".1"
      />
    </svg>
  );
};

function AccountList() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // New state for student profile modal
  const [studentProfileModalVisible, setStudentProfileModalVisible] = useState(false);
  const [studentProfileForm] = Form.useForm();
  const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);

  // New state for student information
  const [studentInfo, setStudentInfo] = useState([]);
  const [loadingStudentInfo, setLoadingStudentInfo] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  // Pagination state for student list
  const [studentPage, setStudentPage] = useState(1);
  const [studentPageSize, setStudentPageSize] = useState(3);

  // Lấy danh sách tài khoản từ API (full dữ liệu)
  const fetchAccounts = async () => {
    try {
      // Gọi đúng endpoint GET /admin/get-all-account
      const res = await getAllAccounts();
      console.log('API /admin/get-all-account response:', res); // Debug dữ liệu trả về
      // Thêm log object mẫu để xác định trường dữ liệu thực tế
      if (Array.isArray(res.data) && res.data.length > 0) {
        console.log('Sample account object:', res.data[0]);
      }
      // Lấy đúng mảng tài khoản từ res.data
      const data = Array.isArray(res.data) ? res.data : [];
      setAccounts(data);
    } catch (err) {
      setAccounts([]);
      message.error("Không thể tải danh sách tài khoản từ server!");
    }
  };

  // Thống kê
  const stats = {
    total: accounts.length,
    // Không có trường trạng thái/role text, nên chỉ đếm tổng
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    console.log('Edit record:', record); // Log để kiểm tra dữ liệu khi bấm sửa
    form.setFieldsValue(record);
    setEditingId(record.userID);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Giá trị form gửi lên update:', values);
      if (editingId) {
        // Gọi API update user - chỉ gửi các trường có giá trị, đúng tên trường backend yêu cầu (chữ thường)
        const payload = {};
        if (values.userName) payload.userName = values.userName;
        // Chỉ update password nếu người dùng nhập mới
        if (values.password && values.password.trim() !== '') {
          payload.password = values.password;
        }
        if (values.name) payload.name = values.name;
        if (values.email) payload.email = values.email;
        if (values.phone) payload.phone = values.phone;
        console.log('Payload gửi lên API updateUserInfo:', payload);
        await updateUserInfo(payload);
        message.success("Cập nhật tài khoản thành công!");
      } else {
        // Gửi lên API tạo tài khoản đúng định dạng backend yêu cầu
        const payload = [{
          userName: values.userName,
          password: values.password,
          roleName: values.roleName
        }];
        await createAccounts(payload);
        message.success("Thêm tài khoản thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
      await fetchAccounts(); // Đồng bộ lại danh sách
    } catch (err) {
      // Hiển thị lỗi chi tiết nếu có
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Lưu tài khoản thất bại!");
      }
    }
  };

  const handleDelete = async (record) => {
    try {
      if (record.roleName === "Admin") {
        message.error("Không thể xóa tài khoản Admin!");
        return;
      }
      // Gọi API xóa user - chỉ gửi UserName đúng với backend
      await deleteUser(record.userName);
      message.success("Xóa tài khoản thành công!");
      await fetchAccounts(); // Đồng bộ lại danh sách
    } catch (err) {
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Xóa tài khoản thất bại!");
      }
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Function to fetch student information for parent
  const fetchStudentInfo = async (userName, userID) => {
    if (!userName && !userID) return;
    
    console.log('🔍 fetchStudentInfo called with userName:', userName, 'userID:', userID);
    setLoadingStudentInfo(true);
    
    try {
      console.log('📡 Fetching student info for parent:', userName, 'with ID:', userID);
      
      // Since the API endpoint is not working, use mock data based on the database table you provided
      // This is temporary until the backend API is implemented
      console.log('⚠️ Using mock data since API endpoint is not available');
      
      let mockStudentData = [];
      
      // Mock data based on your database table for user U0010 (user4)
      if (userID === 'U0010') {
        mockStudentData = [
          {
            StudentID: 'ST0007',
            StudentName: 'Pham Van G',
            Class: '1A4',
            StudentAvata: 'avatar7.png',
            RelationName: 'Con trai',
            Nationality: 'Vietnam',
            Ethnicity: 'Kinh',
            Birthday: '2015-07-18T00:00:00.0000000',
            Sex: 'Nam',
            Location: 'Can Tho',
            ParentID: 'U0010'
          },
          {
            StudentID: 'ST0008',
            StudentName: 'Pham Thi H',
            Class: '1A4',
            StudentAvata: 'avatar8.png',
            RelationName: 'Con gái',
            Nationality: 'Vietnam',
            Ethnicity: 'Kinh',
            Birthday: '2017-04-25T00:00:00.0000000',
            Sex: 'Nữ',
            Location: 'Can Tho',
            ParentID: 'U0010'
          },
          {
            StudentID: 'ST0009',
            StudentName: 'khoafcxcx',
            Class: '1A1',
            StudentAvata: null,
            RelationName: 'Cha',
            Nationality: 'Việt Nam',
            Ethnicity: 'Kinh',
            Birthday: '2025-07-23T17:00:00.0000000',
            Sex: 'Male',
            Location: 'dadxcxcxcxcx',
            ParentID: 'U0010'
          },
          {
            StudentID: 'ST0010',
            StudentName: 'sasa',
            Class: '1A1',
            StudentAvata: null,
            RelationName: 'Mẹ',
            Nationality: 'Việt Nam',
            Ethnicity: 'Kinh',
            Birthday: '2025-07-23T17:00:00.0000000',
            Sex: 'Nam',
            Location: 'sdsd',
            ParentID: 'U0010'
          },
          {
            StudentID: 'ST0011',
            StudentName: 'ada',
            Class: '1A1',
            StudentAvata: null,
            RelationName: 'Con gái',
            Nationality: 'Việt Nam',
            Ethnicity: 'Kinh',
            Birthday: '2025-07-23T17:00:00.0000000',
            Sex: 'Nữ',
            Location: 'ada',
            ParentID: 'U0010'
          }
        ];
      } else if (userID === 'U0007') {
        // Mock data for user U0007 based on your database
        mockStudentData = [
          {
            StudentID: 'ST0001',
            StudentName: 'Nguyen Van A',
            Class: '1A1',
            StudentAvata: 'avatar1.png',
            RelationName: 'Con trai',
            Nationality: 'Vietnam',
            Ethnicity: 'Kinh',
            Birthday: '2015-05-10T00:00:00.0000000',
            Sex: 'Nam',
            Location: 'Hanoi',
            ParentID: 'U0007'
          },
          {
            StudentID: 'ST0002',
            StudentName: 'Nguyen Thi B',
            Class: '1A1',
            StudentAvata: 'avatar2.png',
            RelationName: 'Con gái',
            Nationality: 'Vietnam',
            Ethnicity: 'Kinh',
            Birthday: '2017-08-15T00:00:00.0000000',
            Sex: 'Nữ',
            Location: 'Hanoi',
            ParentID: 'U0007'
          }
        ];
      }
      
      console.log('🎯 Mock student data loaded:', mockStudentData);
      console.log('🔢 Number of students found:', mockStudentData.length);
      
      if (mockStudentData.length > 0) {
        console.log('📋 Sample student object:', mockStudentData[0]);
      }
      
      setStudentInfo(mockStudentData);
      
      // TODO: Replace this mock implementation with actual API call when backend is ready
      /*
      // Approach 1: Try with userID instead of userName
      console.log('🔄 Trying approach 1: POST with userID');
      try {
        const response1 = await axiosClient.post('/admin/get-student-info-by-parent', 
          JSON.stringify(userID),
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('✅ Success with userID approach:', response1);
        const studentData = Array.isArray(response1.data) ? response1.data : [];
        setStudentInfo(studentData);
        return;
      } catch (error1) {
        console.log('❌ Approach 1 failed:', error1.response?.status);
      }
      */
      
    } catch (error) {
      console.error('❌ Error in mock implementation:', error);
      setStudentInfo([]);
    } finally {
      setLoadingStudentInfo(false);
    }
  };

  const handleViewDetails = (record) => {
    console.log('👁️ handleViewDetails called with record:', record);
    console.log('🔍 Record roleName:', record.roleName);
    console.log('🔍 Record userName:', record.userName);
    console.log('🔍 Record userID:', record.userID);
    
    setSelectedAccount(record);
    setDetailModalVisible(true);
    setSelectedStudentDetail(null); // Reset selected student detail when opening modal
    setStudentPage(1); // Reset pagination when opening modal
    
    // Re-enable student info fetching now that we know the data structure
    if (record.roleName === "Parent" || record.roleName === "Admin") {
      console.log('✅ Role matches Parent or Admin, calling fetchStudentInfo...');
      fetchStudentInfo(record.userName, record.userID);
    } else {
      console.log('❌ Role does not match Parent or Admin, setting empty student info');
      setStudentInfo([]);
    }
  };

  // Thêm hàm import tài khoản từ file
  const handleImportAccounts = async (file) => {
    try {
      console.log('File to upload:', file);
      console.log('File name:', file.name);
      console.log('File type:', file.type);
      console.log('File size:', file.size);

      // Kiểm tra file có hợp lệ không
      if (!file) {
        message.error("Vui lòng chọn file!");
        return;
      }

      // Kiểm tra định dạng file
      const allowedTypes = [
        'application/json',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(json|csv|xlsx|xls)$/i)) {
        message.error("Chỉ chấp nhận file JSON, CSV, XLS, XLSX!");
        return;
      }

      message.loading({ content: 'Đang import tài khoản...', key: 'import' });

      // Gọi trực tiếp bằng axiosClient để debug
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Calling API directly with FormData...');
      
      const response = await axiosClient.post('/admin/get-users-from-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Import response:', response);
      
      message.success({ content: "Import tài khoản thành công!", key: 'import' });
      await fetchAccounts();
    } catch (err) {
      console.error('Import error:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = "Import tài khoản thất bại!";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = "Định dạng file không hợp lệ hoặc file bị lỗi!";
      }
      
      message.error({ 
        content: errorMessage, 
        key: 'import' 
      });
    }
  };

  const handleCreateStudentProfile = (record) => {
    setSelectedUserForProfile(record);
    studentProfileForm.resetFields();
    // Set initial values for form fields with default values
    studentProfileForm.setFieldsValue({
      nationality: "Việt Nam",
      ethnicity: "Kinh"
    });
    setStudentProfileModalVisible(true);
  };

  const handleStudentProfileModalOk = async () => {
    try {
      const values = await studentProfileForm.validateFields();
      console.log('📋 Form values received:', values);
      
      // Check each individual value before creating the object
      console.log('🔍 Individual field checks:');
      console.log('  studentName:', values.studentName, '(type:', typeof values.studentName, ')');
      console.log('  class:', values.class, '(type:', typeof values.class, ')');
      console.log('  sex:', values.sex, '(type:', typeof values.sex, ')');
      console.log('  location:', values.location, '(type:', typeof values.location, ')');
      console.log('  relationName:', values.relationName, '(type:', typeof values.relationName, ')');
      console.log('  nationality:', values.nationality, '(type:', typeof values.nationality, ')');
      console.log('  ethnicity:', values.ethnicity, '(type:', typeof values.ethnicity, ')');
      console.log('  studentAvata:', values.studentAvata, '(type:', typeof values.studentAvata, ')');
      console.log('  birthday:', values.birthday, '(type:', typeof values.birthday, ')');
      console.log('  selectedUserForProfile.userName:', selectedUserForProfile.userName, '(type:', typeof selectedUserForProfile.userName, ')');
      
      // Create the student data object with the exact field names the API expects
      const studentData = {
        StudentName: values.studentName,
        Class: values.class,
        StudentAvata: values.studentAvata || null,
        RelationName: values.relationName,
        Nationality: values.nationality,
        Ethnicity: values.ethnicity,
        Birthday: values.birthday ? values.birthday.toISOString() : null,
        Sex: values.sex,
        Location: values.location,
        parentUserName: selectedUserForProfile.userName
      };
      
      console.log('🔄 Student data with the correct case mix:', studentData);
      
      // Check each field in the final object
      console.log('🔍 Final object field checks:');
      Object.entries(studentData).forEach(([key, value]) => {
        console.log(`  ${key}:`, value, '(type:', typeof value, ', length:', value?.length || 'N/A', ')');
      });
      
      // Try sending the data directly without wrapper first
      console.log('📦 Trying direct payload (no wrapper):', JSON.stringify(studentData, null, 2));
      
      try {
        // Call API to create student profile - try direct object first
        await createStudentProfile(studentData);
      } catch (directError) {
        console.warn('🔄 Direct approach failed, trying with wrapper...');
        
        // If direct approach fails, try with wrapper
        const studentProfileData = {
          createStudentRequest: studentData
        };
        
        console.log('📦 Trying wrapped payload:', JSON.stringify(studentProfileData, null, 2));
        await createStudentProfile(studentProfileData);
      }
      
      message.success("Tạo hồ sơ học sinh thành công!");
      setStudentProfileModalVisible(false);
      studentProfileForm.resetFields();
      setSelectedUserForProfile(null);
    } catch (err) {
      console.error('❌ Create student profile error:', err);
      console.error('📊 Error object details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
      
      // Enhanced error logging
      if (err.response) {
        console.error('🔍 Response status:', err.response.status);
        console.error('🔍 Response headers:', err.response.headers);
        console.error('🔍 Response data structure:', err.response.data);
        console.error('🔍 Response data type:', typeof err.response.data);
        
        // Log specific error fields if available
        if (err.response.data?.errors) {
          console.error('📋 Validation errors details:', err.response.data.errors);
          console.error('🔎 Error keys:', Object.keys(err.response.data.errors));
          
          // Log each error field individually
          Object.entries(err.response.data.errors).forEach(([field, errors]) => {
            console.error(`❗ Field "${field}" errors:`, errors);
          });
        }
        
        // Extract detailed error message if available
        let errorMessage = "Tạo hồ sơ học sinh thất bại!";
        
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.errors) {
          if (typeof err.response.data.errors === 'string') {
            errorMessage = err.response.data.errors;
          } else {
            // Check for specific validation error paths
            const errors = err.response.data.errors;
            if (errors.createStudentRequest) {
              const requestErrors = Array.isArray(errors.createStudentRequest) 
                ? errors.createStudentRequest.join(', ') 
                : errors.createStudentRequest;
              errorMessage = `Lỗi dữ liệu: ${requestErrors}`;
            } else if (errors['$.studentAvata']) {
              const avatarErrors = Array.isArray(errors['$.studentAvata']) 
                ? errors['$.studentAvata'].join(', ') 
                : errors['$.studentAvata'];
              errorMessage = `Lỗi ảnh đại diện: ${avatarErrors}`;
            } else {
              const errorDetails = Object.entries(errors)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('; ');
              errorMessage = `Lỗi dữ liệu: ${errorDetails}`;
            }
          }
        }
        
        message.error(errorMessage);
      } else {
        message.error("Kết nối đến máy chủ thất bại!");
      }
    }
  };

  const columns = [
    {
      title: "Mã người dùng",
      dataIndex: "userID",
      key: "userID",
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Mật khẩu",
      dataIndex: "password",
      key: "password",
      render: (text) => text ? text : <span style={{color: '#aaa'}}>********</span>
    },
    {
      title: "Vai trò",
      dataIndex: "roleName",
      key: "roleName",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active, record) => (
        <>
          <Tag color={active ? "green" : "red"}>{active ? "Kích hoạt" : "Khoá"}</Tag>
          {!active && (
            <Button
              size="small"
              type="primary"
              style={{ marginLeft: 8 }}
              onClick={async () => {
                try {
                  // Gọi API mở khoá tài khoản qua userApi.js
                  await activeAccount(record.userName);
                  message.success("Đã mở khoá tài khoản!");
                  await fetchAccounts();
                } catch (err) {
                  message.error("Mở khoá thất bại!");
                }
              }}
            >
              Mở khoá
            </Button>
          )}
        </>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          {record.roleName === "Parent" && (
            <Button 
              type="link" 
              icon={<UserAddOutlined />} 
              onClick={() => handleCreateStudentProfile(record)}
              title="Tạo hồ sơ học sinh"
            />
          )}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tài khoản này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  useEffect(() => {
    fetchAccounts();
  }, []);
  return (
    <div className="p-0 sm:p-8 bg-gradient-to-br from-blue-200 via-white to-blue-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Header tinh tế hơn */}
        <div className="mb-14 flex items-center gap-8">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-400 to-blue-700 rounded-full p-7 shadow-2xl flex items-center justify-center border-4 border-white animate-fade-in">
              <UserOutlined className="text-white text-5xl drop-shadow-xl" />
            </div>
            <span className="absolute -bottom-3 -right-3 bg-white rounded-full px-3 py-1 text-xs text-blue-700 font-bold shadow border border-blue-100 select-none tracking-wide" style={{letterSpacing: 1}}>ACCOUNT</span>
          </div>
          <div className="flex flex-col gap-1">
            <Title level={2} className="text-blue-900 mb-0 font-black tracking-widest drop-shadow-xl leading-tight" style={{letterSpacing: 2}}>Quản Lý Tài Khoản</Title>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 animate-pulse shadow"></span>
              <Text type="secondary" className="text-lg font-medium text-gray-600 italic tracking-wide">Quản lý tài khoản người dùng hệ thống</Text>
            </div>
          </div>
        </div>
        <Row gutter={[24, 24]} className="mb-10">
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-3xl shadow-2xl border-blue-200 bg-white/90 hover:shadow-blue-200 transition-all duration-200">
              <Statistic title={<span className="text-gray-500 font-semibold">Tổng tài khoản</span>} value={stats.total} prefix={<UserOutlined />} valueStyle={{ color: '#2563eb', fontWeight: 800 }} />
            </Card>
          </Col>
        </Row>
        <Card className="rounded-3xl shadow-2xl border-blue-200 bg-white/95">
          <Row gutter={[16, 16]} className="mb-8 flex flex-wrap items-center">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm tài khoản..."
                prefix={<SearchOutlined />}
                allowClear
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                className="rounded-2xl shadow border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200 text-lg px-4 py-2"
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={16} className="flex justify-end items-center gap-6">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="rounded-2xl shadow-xl bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 font-bold px-8 py-2 text-lg" size="large">
                Thêm tài khoản
              </Button>
              <label className="inline-flex items-center cursor-pointer bg-blue-50 border border-blue-200 rounded-2xl px-5 py-2 ml-2 hover:bg-blue-100 transition gap-2 shadow-md">
                <span className="text-blue-600 font-semibold flex items-center gap-1"><UploadIcon />Import File</span>
                <input
                  type="file"
                  accept=".json,.csv,.xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImportAccounts(file);
                    }
                    // Reset input để có thể chọn cùng file lần nữa
                    e.target.value = '';
                  }}
                />
              </label>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={accounts.filter(
              (account) =>
                (account.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
                account.userID?.toString().includes(searchText))
            )}
            rowKey="userID"
            className="rounded-3xl overflow-hidden shadow-lg border border-blue-100 bg-white/80 hover:bg-blue-50 transition-all duration-150 text-base"
            pagination={{ pageSize: 8, showSizeChanger: false }}
            rowClassName={() => 'hover:bg-blue-100 transition-all duration-150'}
          />
        </Card>
        {/* Modal Thêm/Sửa */}
        <Modal
          title={<span className="font-extrabold text-blue-700 text-xl">{editingId ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}</span>}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setEditingId(null);
          }}
          width={editingId ? 700 : 500}
          okText={editingId ? "Cập nhật" : "Tạo mới"}
          cancelText="Hủy"
          className="rounded-3xl"
          styles={{ 
            body: { 
              borderRadius: 32, 
              padding: 40, 
              background: 'linear-gradient(135deg,#e0eaff 60%,#f0f6ff 100%)' 
            } 
          }}
        >
          <Form form={form} layout="vertical" className="space-y-3">
            {editingId && (
              <Form.Item
                name="userID"
                label={<span className="font-bold">Mã người dùng</span>}
                rules={[{ required: true, message: "Vui lòng nhập mã người dùng" }]}
              >
                <Input disabled className="rounded-2xl text-base" />
              </Form.Item>
            )}
            <Form.Item
              name="userName"
              label={<span className="font-bold">Tên đăng nhập</span>}
              rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
            >
              <Input className="rounded-2xl text-base" />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span className="font-bold">Mật khẩu</span>}
              rules={[{ required: !editingId, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password 
                className="rounded-2xl text-base" 
                placeholder={editingId ? "Để trống nếu không muốn thay đổi mật khẩu" : "Nhập mật khẩu"}
              />
            </Form.Item>
            
            {/* Chỉ hiển thị các trường bổ sung khi edit */}
            {editingId && (
              <>
                <Form.Item
                  name="name"
                  label={<span className="font-bold">Họ tên</span>}
                  rules={[{ required: false, message: "Vui lòng nhập họ tên" }]}
                >
                  <Input className="rounded-2xl text-base" placeholder="Nhập họ tên đầy đủ" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label={<span className="font-bold">Email</span>}
                  rules={[
                    { required: false, message: "Vui lòng nhập email" },
                    { type: 'email', message: 'Email không hợp lệ' }
                  ]}
                >
                  <Input className="rounded-2xl text-base" placeholder="Nhập địa chỉ email" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label={<span className="font-bold">Số điện thoại</span>}
                  rules={[
                    { required: false, message: "Vui lòng nhập số điện thoại" },
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số' }
                  ]}
                >
                  <Input className="rounded-2xl text-base" placeholder="Nhập số điện thoại" />
                </Form.Item>
              </>
            )}
            
            {!editingId && (
              <Form.Item
                name="roleName"
                label={<span className="font-bold">Vai trò</span>}
                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
              >
                <Select placeholder="Chọn vai trò" className="rounded-2xl text-base">
                  <Option value="Nurse">Nurse</Option>
                  <Option value="Parent">Parent</Option>
                </Select>
              </Form.Item>
            )}
          </Form>
        </Modal>

        {/* New Modal for Student Profile */}
        <Modal
          title={<span className="font-extrabold text-blue-700 text-xl">Tạo hồ sơ học sinh</span>}
          open={studentProfileModalVisible}
          onOk={handleStudentProfileModalOk}
          onCancel={() => {
            setStudentProfileModalVisible(false);
            studentProfileForm.resetFields();
            setSelectedUserForProfile(null);
          }}
          width={700}
          okText="Tạo hồ sơ"
          cancelText="Hủy"
          className="rounded-3xl"
          styles={{ 
            body: { 
              borderRadius: 32, 
              padding: 40, 
              background: 'linear-gradient(135deg,#e0eaff 60%,#f0f6ff 100%)' 
            } 
          }}
        >
          <Form 
            form={studentProfileForm} 
            layout="vertical" 
            className="space-y-3"
            initialValues={{
              nationality: "Việt Nam",
              ethnicity: "Kinh"
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="studentName"
                  label={<span className="font-bold">Tên học sinh</span>}
                  rules={[{ required: true, message: "Vui lòng nhập tên học sinh" }]}
                >
                  <Input className="rounded-2xl text-base" placeholder="Nhập tên học sinh" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="class"
                  label={<span className="font-bold">Lớp học</span>}
                  rules={[{ required: true, message: "Vui lòng nhập lớp học" }]}
                >
                  <Input className="rounded-2xl text-base" placeholder="Nhập lớp học" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="birthday"
                  label={<span className="font-bold">Ngày sinh</span>}
                  rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                >
                  <DatePicker 
                    className="rounded-2xl text-base w-full" 
                    placeholder="Chọn ngày sinh"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sex"
                  label={<span className="font-bold">Giới tính</span>}
                  rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                >
                  <Select placeholder="Chọn giới tính" className="rounded-2xl text-base">
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="location"
              label={<span className="font-bold">Địa chỉ</span>}
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
            >
              <Input className="rounded-2xl text-base" placeholder="Nhập địa chỉ" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="relationName"
                  label={<span className="font-bold">Quan hệ với phụ huynh</span>}
                  rules={[{ required: true, message: "Vui lòng nhập quan hệ" }]}
                >
                  <Select placeholder="Chọn quan hệ" className="rounded-2xl text-base">
                    <Option value="Con trai">Con trai</Option>
                    <Option value="Con gái">Con gái</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="nationality"
                  label={<span className="font-bold">Quốc tịch</span>}
                  rules={[{ required: true, message: "Vui lòng nhập quốc tịch" }]}
                >
                  <Input className="rounded-2xl text-base" placeholder="Nhập quốc tịch" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ethnicity"
                  label={<span className="font-bold">Dân tộc</span>}
                  rules={[{ required: true, message: "Vui lòng nhập dân tộc" }]}
                >
                  <Input className="rounded-2xl text-base" placeholder="Nhập dân tộc" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="studentAvata"
                  label={<span className="font-bold">Ảnh đại diện (URL)</span>}
                >
                  <Input className="rounded-2xl text-base" placeholder="Nhập URL ảnh đại diện (không bắt buộc)" />
                </Form.Item>
              </Col>
            </Row>

            {selectedUserForProfile && (
              <Form.Item
                label={<span className="font-bold">Phụ huynh</span>}
              >
                <Input 
                  className="rounded-2xl text-base" 
                  value={`${selectedUserForProfile.userName} (ID: ${selectedUserForProfile.userID})`} 
                  disabled 
                />
              </Form.Item>
            )}
          </Form>
        </Modal>

        {/* Modal Chi tiết tài khoản */}
        <Modal
          title={<span className="font-extrabold text-blue-700 text-xl">Chi tiết tài khoản</span>}
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setStudentInfo([]);
            setSelectedStudentDetail(null);
          }}
          footer={[
            <Button key="close" onClick={() => {
              setDetailModalVisible(false);
              setStudentInfo([]);
              setSelectedStudentDetail(null);
            }} className="rounded-2xl font-bold text-base">Đóng</Button>,
          ]}
          width={700}
          className="rounded-3xl"
          styles={{ 
            body: { 
              borderRadius: 32, 
              background: 'linear-gradient(135deg,#e0eaff 60%,#f0f6ff 100%)' 
            } 
          }}
        >
          {selectedAccount && (
            <div>
              <Descriptions bordered column={1} size="middle" className="rounded-3xl bg-white/95 text-base mb-6">
                <Descriptions.Item label={<span className="font-bold">Mã người dùng</span>}>{selectedAccount.userID}</Descriptions.Item>
                <Descriptions.Item label={<span className="font-bold">Tên đăng nhập</span>}>{selectedAccount.userName}</Descriptions.Item>
                <Descriptions.Item label={<span className="font-bold">Mật khẩu</span>}>{selectedAccount.password}</Descriptions.Item>
                <Descriptions.Item label={<span className="font-bold">Vai trò</span>}>{selectedAccount.roleName}</Descriptions.Item>
                <Descriptions.Item label={<span className="font-bold">Trạng thái</span>}>{selectedAccount.isActive ? <Tag color="green">Kích hoạt</Tag> : <Tag color="red">Khoá</Tag>}</Descriptions.Item>
              </Descriptions>

              {/* Student Information Section for Parent and Admin accounts */}
              {(selectedAccount.roleName === "Parent" || selectedAccount.roleName === "Admin") && (
                <div>
                  <Title level={4} className="text-blue-700 mb-4">
                    {selectedAccount.roleName === "Admin" ? "Thông tin học sinh (Admin View)" : "Thông tin học sinh"}
                  </Title>
                  {loadingStudentInfo ? (
                    <div className="text-center py-4">
                      <span>Đang tải thông tin học sinh...</span>
                    </div>
                  ) : studentInfo.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      {/* Left side - Student list */}
                      <div className="lg:col-span-2 space-y-3">
                        <div className="flex justify-between items-center">
                          <Text className="font-bold text-gray-700 text-base">Danh sách học sinh:</Text>
                          <Text className="text-sm text-gray-500">
                            {studentInfo.length} học sinh
                          </Text>
                        </div>
                        <div className="space-y-3">
                          {studentInfo
                            .slice((studentPage - 1) * studentPageSize, studentPage * studentPageSize)
                            .map((student, index) => (
                              <Card 
                                key={student.StudentID || index} 
                                className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 transform hover:-translate-y-1 ${
                                  selectedStudentDetail?.StudentID === student.StudentID 
                                    ? 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-500 shadow-lg scale-[1.02] ring-2 ring-blue-300' 
                                    : 'bg-white border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-300'
                                }`}
                                size="small"
                                onClick={() => setSelectedStudentDetail(student)}
                              >
                                <div className="flex items-center justify-between p-2">
                                  <div className="flex-1 min-w-0">
                                    <Text className={`font-semibold block truncate text-sm ${
                                      selectedStudentDetail?.StudentID === student.StudentID 
                                        ? 'text-blue-900' 
                                        : 'text-blue-800'
                                    }`}>
                                      {student.StudentName || 'N/A'}
                                    </Text>
                                    <Text className="text-gray-600 text-xs">
                                      Lớp: {student.Class || 'N/A'}
                                    </Text>
                                  </div>
                                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    selectedStudentDetail?.StudentID === student.StudentID
                                      ? 'text-blue-700 bg-blue-200'
                                      : 'text-gray-500 bg-gray-100'
                                  }`}>
                                    {student.StudentID}
                                  </div>
                                </div>
                              </Card>
                          ))}
                        </div>
                        
                        {/* Pagination for student list */}
                        {studentInfo.length > studentPageSize && (
                          <div className="flex justify-center mt-4">
                            <Pagination
                              current={studentPage}
                              pageSize={studentPageSize}
                              total={studentInfo.length}
                              onChange={(page, pageSize) => {
                                setStudentPage(page);
                                setStudentPageSize(pageSize);
                              }}
                              showSizeChanger={true}
                              pageSizeOptions={['3', '5', '10']}
                              size="small"
                              showQuickJumper={false}
                              showTotal={false}
                              className="text-sm"
                            />
                          </div>
                        )}
                      </div>

                      {/* Right side - Selected student details */}
                      <div className="lg:col-span-3">
                        <Text className="font-bold text-gray-700 text-base mb-3 block">Chi tiết học sinh:</Text>
                        {selectedStudentDetail ? (
                          <div className="h-auto">
                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-lg">
                              <div className="mb-4 text-center">
                                <Title level={5} className="text-blue-800 mb-1">
                                  {selectedStudentDetail.StudentName}
                                </Title>
                                <Text className="text-gray-600 text-sm">
                                  {selectedStudentDetail.StudentID} - Lớp {selectedStudentDetail.Class}
                                </Text>
                              </div>
                              <Descriptions 
                                bordered 
                                column={1} 
                                size="small"
                                className="bg-white rounded-lg overflow-hidden shadow-sm"
                                labelStyle={{ 
                                  backgroundColor: '#f8fafc', 
                                  fontWeight: 'bold',
                                  width: '30%',
                                  borderRight: '2px solid #e2e8f0',
                                  fontSize: '13px',
                                  padding: '8px 12px'
                                }}
                                contentStyle={{ 
                                  backgroundColor: '#ffffff',
                                  padding: '8px 12px',
                                  fontSize: '13px'
                                }}
                              >
                                <Descriptions.Item label="Giới tính">
                                  <span className="text-gray-800">{selectedStudentDetail.Sex || 'N/A'}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày sinh">
                                  <span className="text-gray-800">
                                    {selectedStudentDetail.Birthday ? new Date(selectedStudentDetail.Birthday).toLocaleDateString('vi-VN') : 'N/A'}
                                  </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ">
                                  <span className="text-gray-800">{selectedStudentDetail.Location || 'N/A'}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Quan hệ">
                                  <span className="text-gray-800">{selectedStudentDetail.RelationName || 'N/A'}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Quốc tịch">
                                  <span className="text-gray-800">{selectedStudentDetail.Nationality || 'N/A'}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Dân tộc">
                                  <span className="text-gray-800">{selectedStudentDetail.Ethnicity || 'N/A'}</span>
                                </Descriptions.Item>
                                {selectedStudentDetail.StudentAvata && (
                                  <Descriptions.Item label="Ảnh đại diện">
                                    <span className="text-gray-800">{selectedStudentDetail.StudentAvata}</span>
                                  </Descriptions.Item>
                                )}
                                {selectedAccount.roleName === "Admin" && (
                                  <Descriptions.Item label="Parent ID">
                                    <span className="text-gray-800">{selectedStudentDetail.ParentID || 'N/A'}</span>
                                  </Descriptions.Item>
                                )}
                              </Descriptions>
                            </Card>
                          </div>
                        ) : (
                          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 min-h-[200px] flex items-center justify-center">
                            <div className="text-center text-gray-500 p-8">
                              <UserOutlined className="text-4xl text-gray-400 mb-3 block" />
                              <p className="text-base font-medium mb-1">Chọn một học sinh</p>
                              <p className="text-sm text-gray-400">để xem thông tin chi tiết</p>
                            </div>
                          </Card>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>
                        {selectedAccount.roleName === "Admin" 
                          ? "Không tìm thấy thông tin học sinh nào cho user này."
                          : "Chưa có thông tin học sinh nào được tạo cho phụ huynh này."
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default AccountList;
