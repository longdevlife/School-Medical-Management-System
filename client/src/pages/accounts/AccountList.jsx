import React, { useState, useEffect } from "react";
import dayjs from 'dayjs';
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
  activeAccount,
  createStudentProfile,
  createListStudent,
  getStudentsFromFile,
  getUsersFromFile,
} from "../../api/userApi";
import axiosClient from "../../api/axiosClient";
import studentApi from "../../api/studentApi";

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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
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

  // New state for edit student modal
  const [editStudentModalVisible, setEditStudentModalVisible] = useState(false);
  const [editStudentForm] = Form.useForm();
  const [editingStudent, setEditingStudent] = useState(null);

  // New state for file upload (only for edit student)
  const [uploadedAvatarFile, setUploadedAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // New state for create student profile file upload
  const [createAvatarFile, setCreateAvatarFile] = useState(null);
  const [createAvatarPreview, setCreateAvatarPreview] = useState(null);

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
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    console.log('Edit record:', record);
    setEditingRecord(record);
    editForm.setFieldsValue({
      userID: record.userID,
      userName: record.userName,
      name: record.name || '',
      email: record.email || '',
      phone: record.phone || '',
      roleName: record.roleName
    });
    setIsEditModalVisible(true);
  };

  const handleCreateOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Creating new account with values:', values);
      
      const payload = [{
        userName: values.userName,
        password: values.password,
        name: values.name || '',
        email: values.email || '', 
        phone: values.phone || '',
        roleName: values.roleName
      }];
      
      console.log('Create account payload:', payload);
      await createAccounts(payload);
      message.success("Thêm tài khoản thành công!");
      
      setIsModalVisible(false);
      form.resetFields();
      await fetchAccounts();
    } catch (err) {
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Tạo tài khoản thất bại!");
      }
    }
  };

  const handleUpdateOk = async () => {
    try {
      const values = await editForm.validateFields();
      console.log('Updating account with values:', values);
      
      const payload = {};
      if (values.userName) payload.userName = values.userName;
      if (values.password && values.password.trim() !== '') {
        payload.password = values.password;
      }
      if (values.name) payload.name = values.name;
      if (values.email) payload.email = values.email;
      if (values.phone) payload.phone = values.phone;
      
      console.log('Update account payload:', payload);
      await updateUserInfo(payload);
      message.success("Cập nhật tài khoản thành công!");
      
      setIsEditModalVisible(false);
      editForm.resetFields();
      setEditingRecord(null);
      await fetchAccounts();
    } catch (err) {
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Cập nhật tài khoản thất bại!");
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

  // Function to fetch student information for parent from database only
  const fetchStudentInfo = async (userName, userID) => {
    if (!userName && !userID) return;
    
    console.log('🔍 fetchStudentInfo called with userName:', userName, 'userID:', userID);
    console.log('🎯 OBJECTIVE: Find ALL student profiles where ParentID == UserID');
    console.log(`🎯 Search criteria: student.ParentID == "${userID}"`);
    console.log('📋 Database: [SchoolMedicalManagement].[dbo].[StudentProfile]');
    setLoadingStudentInfo(true);
    
    try {
      console.log('📡 Fetching student info from backend API...');
      console.log(`📡 Using GET /api/admin/get-student-info-by-parentID/${userID}`);
      
      // Use the correct API endpoint
      const response = await studentApi.parent.getStudentInfoByParent(userID);
      console.log('📥 Correct API response:', response);
      console.log('📊 Raw response data:', response.data);
      
      const studentData = Array.isArray(response.data) ? response.data : [];
      
      if (studentData.length > 0) {
        console.log(`🎯 DATABASE SUCCESS! Found ${studentData.length} students for ${userName}`);
        console.log('🎯 Data source: [SchoolMedicalManagement].[dbo].[StudentProfile]');
        console.log('🔍 Full student data structure:', studentData);
        console.log('🔍 First student object keys:', Object.keys(studentData[0] || {}));
        console.log('🔍 First student full object:', JSON.stringify(studentData[0], null, 2));
        
        // Validate StudentProfile table structure with flexible field mapping
        studentData.forEach((student, index) => {
          console.log(`📋 Student ${index + 1} full object:`, student);
          
          // Try different possible field name variations
          const studentID = student.StudentID || student.studentID || student.id || student.ID;
          const studentName = student.StudentName || student.studentName || student.name || student.Name;
          const parentID = student.ParentID || student.parentID || student.parentId || student.ParentId;
          
          console.log(`📋 Student ${index + 1} (${studentID}): ${studentName}`);
          console.log(`   ParentID variations checked:`);
          console.log(`     student.ParentID: "${student.ParentID}"`);
          console.log(`     student.parentID: "${student.parentID}"`);
          console.log(`     student.parentId: "${student.parentId}"`);
          console.log(`     student.ParentId: "${student.ParentId}"`);
          console.log(`   Expected: "${userID}"`);
          
          const hasCorrectParentID = parentID === userID;
          console.log(`   Match result: ${hasCorrectParentID ? '✅' : '❌'}`);
        });
        
        setStudentInfo(studentData);
      } else {
        console.log(`🚫 No students found for ParentID: ${userID}`);
        setStudentInfo([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching student info:', error);
      console.error('📄 Error status:', error.response?.status);
      console.error('📄 Error message:', error.message);
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

  // Thêm hàm import tài khoản từ file - REMOVED

  const handleCreateStudentProfile = (record) => {
    setSelectedUserForProfile(record);
    studentProfileForm.resetFields();
    // No need to reset avatar states for create anymore
    // Set initial values for form fields with default values
    studentProfileForm.setFieldsValue({
      nationality: "Việt Nam",
      ethnicity: "Kinh"
    });
    setStudentProfileModalVisible(true);
  };

  // Handle file upload for edit student avatar
  const handleAvatarUpload = (file) => {
    console.log('📸 Edit avatar file selected:', file);
    
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ được chọn file ảnh!');
      return false;
    }
    
    // Validate file size (5MB max)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }
    
    setUploadedAvatarFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    return false; // Prevent auto upload
  };

  // Handle edit student
  const handleEditStudent = (student) => {
    console.log('🔧 Editing student:', student);
    console.log('🔧 Student avatar field:', student.avatar);
    setEditingStudent(student);
    
    // Reset upload states
    setUploadedAvatarFile(null);
    setAvatarPreview(null);
    
    // Update field mapping based on actual API response
    editStudentForm.setFieldsValue({
      studentName: student.studentName || student.StudentName || student.name || '',
      class: student.class || student.Class || student.className || '',
      relationName: student.relationName || student.RelationName || student.relation || '',
      nationality: student.nationality || student.Nationality || student.nation || '',
      ethnicity: student.ethnicity || student.Ethnicity || student.ethnic || '',
      birthday: (student.birthday || student.Birthday || student.birthDate) 
        ? dayjs(student.birthday || student.Birthday || student.birthDate) 
        : null,
      sex: student.sex || student.Sex || student.gender || '',
      location: student.location || student.Location || student.address || ''
    });
    
    // Set existing avatar preview if available
    const existingAvatar = student.avatar || student.StudentAvata || student.studentAvata;
    if (existingAvatar) {
      setAvatarPreview(existingAvatar);
    }
    
    setEditStudentModalVisible(true);
  };

  // Handle update student
  const handleUpdateStudent = async () => {
    try {
      const values = await editStudentForm.validateFields();
      console.log('📝 Updating student with values:', values);
      
      // Prepare student data
      // Add 1 day to birthday before sending to backend
      const birthdayPlusOne = values.birthday ? values.birthday.add(1, 'day') : null;
      const studentData = {
        StudentID: editingStudent.studentID || editingStudent.StudentID || editingStudent.id,
        StudentName: values.studentName,
        Class: values.class,
        RelationName: values.relationName,
        Nationality: values.nationality,
        Ethnicity: values.ethnicity,
        Birthday: birthdayPlusOne ? birthdayPlusOne.toISOString() : null,
        Sex: values.sex,
        Location: values.location
      };
      
      console.log('📤 Prepared student data:', studentData);
      
      // Always use FormData approach since backend expects multipart/form-data
      const formData = new FormData();
      Object.keys(studentData).forEach(key => {
        formData.append(key, studentData[key] || '');
      });
      
      // Handle avatar
      if (uploadedAvatarFile) {
        console.log('📸 Adding uploaded file to FormData');
        formData.append('StudentAvata', uploadedAvatarFile);
      } else {
        console.log('📸 No new avatar file, sending empty StudentAvata');
        formData.append('StudentAvata', '');
      }
      
      console.log('📤 Sending FormData to API...');
      
      // Use the file upload method for consistency
      await studentApi.parent.updateStudentProfileWithFile(formData);
      
      console.log('✅ Student updated successfully');
      
      message.success("Cập nhật thông tin học sinh thành công!");
      setEditStudentModalVisible(false);
      editStudentForm.resetFields();
      setEditingStudent(null);
      setUploadedAvatarFile(null);
      setAvatarPreview(null);
      
      // Refresh student data
      if (selectedAccount) {
        await fetchStudentInfo(selectedAccount.userName, selectedAccount.userID);
      }
      
    } catch (err) {
      console.error('❌ Update student error:', err);
      console.error('📄 Error details:', err.response?.data);
      
      let errorMessage = "Cập nhật thông tin học sinh thất bại!";
      
      if (err.response?.status === 400 && err.response?.data?.errors) {
        console.error('📋 Validation errors breakdown:');
        const errors = err.response.data.errors;
        const errorMessages = Object.entries(errors).map(([field, messages]) => {
          const messageArray = Array.isArray(messages) ? messages : [messages];
          console.error(`  ❌ ${field}: ${messageArray.join(', ')}`);
          return `${field}: ${messageArray.join(', ')}`;
        });
        errorMessage = `Lỗi validation: ${errorMessages.join('; ')}`;
      } else if (err.response?.data?.title) {
        errorMessage = err.response.data.title;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      message.error(errorMessage);
    }
  };

  const handleDeleteStudent = async (student) => {
    try {
      // Update field mapping based on console log: studentID, studentName
      const studentId = student.studentID || student.StudentID || student.id;
      const studentName = student.studentName || student.StudentName || student.name;
      
      console.log('🗑️ Deleting student:', studentId, studentName);
      console.log('🔍 Full student object for delete:', student);
      console.log('🔍 Available fields:', Object.keys(student));
      
      if (!studentId) {
        console.error('❌ No valid student ID found in object:', student);
        message.error("Không tìm thấy mã học sinh để xóa!");
        return;
      }
      
      // Log the exact API call
      console.log(`📡 Making DELETE request to: /admin/delete-student-profile/${studentId}`);
      
      await studentApi.parent.deleteStudentProfile(studentId);
      console.log('✅ Student deleted successfully');
      
      message.success(`Đã xóa học sinh ${studentName} thành công!`);
      
      // Reset selected student if it was the deleted one
      if (selectedStudentDetail && 
          (selectedStudentDetail.studentID || selectedStudentDetail.StudentID || selectedStudentDetail.id) === studentId) {
        setSelectedStudentDetail(null);
      }
      
      // Refresh student data
      if (selectedAccount) {
        await fetchStudentInfo(selectedAccount.userName, selectedAccount.userID);
      }
      
    } catch (err) {
      console.error('❌ Delete student error:', err);
      console.error('📄 Error status:', err.response?.status);
      console.error('📄 Error data:', err.response?.data);
      console.error('📄 Error message:', err.response?.data?.message || err.message);
      
      let errorMessage = "Xóa học sinh thất bại!";
      if (err.response?.status === 400) {
        // Get more specific error from response
        if (err.response.data?.message) {
          errorMessage = `Lỗi 400: ${err.response.data.message}`;
        } else if (typeof err.response.data === 'string') {
          errorMessage = `Lỗi 400: ${err.response.data}`;
        } else {
          errorMessage = "Lỗi 400: Không thể xóa học sinh này. Có thể do ràng buộc dữ liệu.";
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      message.error(errorMessage);
    }
  };

  const handleStudentProfileModalOk = async () => {
    try {
      const values = await studentProfileForm.validateFields();
      console.log('📋 Create student form values received:', values);

      // Debug: Log validation errors details
      console.log('🔍 Form values breakdown:');
      console.log('  StudentName:', values.studentName);
      console.log('  Class:', values.class);
      console.log('  Birthday:', values.birthday);
      console.log('  Sex:', values.sex);
      console.log('  Location:', values.location);
      console.log('  RelationName:', values.relationName);
      console.log('  Nationality:', values.nationality);
      console.log('  Ethnicity:', values.ethnicity);

      // Validate required fields before sending
      if (!values.studentName || values.studentName.trim() === '') {
        message.error('Tên học sinh không được để trống!');
        return;
      }
      
      if (!values.class || values.class.trim() === '') {
        message.error('Lớp học không được để trống!');
        return;
      }
      
      if (!values.birthday) {
        message.error('Ngày sinh không được để trống!');
        return;
      }
      
      if (!values.sex) {
        message.error('Giới tính không được để trống!');
        return;
      }
      
      if (!values.location || values.location.trim() === '') {
        message.error('Địa chỉ không được để trống!');
        return;
      }

      // Direct payload matching Swagger API schema exactly - NO wrapper
      // Add 1 day to birthday before sending to backend
      const birthdayPlusOne = values.birthday ? values.birthday.add(1, 'day') : null;
      const studentData = {
        studentName: values.studentName.trim(),
        class: values.class.trim(),
        studentAvata: null, // Null as allowed by API
        relationName: values.relationName || "Con",
        nationality: values.nationality.trim() || "Việt Nam",
        ethnicity: values.ethnicity.trim() || "Kinh",
        birthday: birthdayPlusOne ? birthdayPlusOne.toISOString() : undefined,
        sex: values.sex,
        location: values.location.trim(),
        parentUserName: selectedUserForProfile.userName
      };

      console.log('🔄 Create student data (direct Swagger schema):', studentData);
      console.log('🔄 JSON stringify:', JSON.stringify(studentData, null, 2));

      await createStudentProfile(studentData);
      console.log('✅ Student profile saved successfully');

      message.success("Tạo hồ sơ học sinh thành công!");
      setStudentProfileModalVisible(false);
      studentProfileForm.resetFields();
      setSelectedUserForProfile(null);

      if (selectedAccount && selectedAccount.userID === selectedUserForProfile.userID) {
        console.log('🔄 Refreshing student data for parent:', selectedAccount.userName);
        await fetchStudentInfo(selectedAccount.userName, selectedAccount.userID);
      }

    } catch (err) {
      console.error('❌ Create student profile error:', err);
      
      // Enhanced error logging
      if (err.response) {
        console.error('🔍 Response status:', err.response.status);
        console.error('🔍 Response data:', err.response.data);
        console.error('🔍 Response headers:', err.response.headers);
        console.error('🔍 Full error object:', JSON.stringify(err.response.data, null, 2));
        
        // Log validation errors in detail
        if (err.response.data?.errors) {
          console.error('📋 Detailed validation errors:');
          Object.entries(err.response.data.errors).forEach(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            console.error(`  ❌ ${field}:`, messageArray);
          });
        }
        
        let errorMessage = "Tạo hồ sơ học sinh thất bại!";
        
        if (err.response.status === 400 && err.response.data?.errors) {
          // Parse validation errors từ .NET API
          const errors = err.response.data.errors;
          const errorFields = Object.keys(errors);
          const errorMessages = errorFields.map(field => {
            const fieldErrors = errors[field];
            return `${field}: ${Array.isArray(fieldErrors) ? fieldErrors.join(', ') : fieldErrors}`;
          });
          errorMessage = `Lỗi validation: ${errorMessages.join('; ')}`;
        } else if (err.response.data?.title) {
          errorMessage = err.response.data.title;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
        
        message.error(errorMessage);
      } else {
        console.error('🔍 Network or other error:', err.message);
        message.error("Kết nối đến máy chủ thất bại!");
      }
    }
  };

  // Import students from file (create student profiles based on existing usernames)
  const handleImportStudents = async (file) => {
    try {
      console.log('📁 Student file to upload:', file);

      if (!file) {
        message.error("Vui lòng chọn file!");
        return;
      }

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

      message.loading({ content: 'Đang import hồ sơ học sinh...', key: 'importStudents' });

      const response = await getStudentsFromFile(file);
      
      console.log('✅ Import students response:', response);
      console.log('📊 Imported students data:', response.data);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('🔍 Analyzing imported students...');
        
        // Extract unique parent usernames from imported students
        const parentUserNames = [...new Set(
          response.data
            .map(student => student.parentUserName || student.ParentUserName || student.parent_user_name)
            .filter(parentName => parentName && parentName.trim() !== '')
        )];
        
        console.log('👥 Parent usernames in file:', parentUserNames);
        
        // Check which parent accounts exist
        const existingParentAccounts = accounts.filter(account => 
          parentUserNames.includes(account.userName) && account.roleName === 'Parent'
        );
        
        const existingParentUserNames = existingParentAccounts.map(account => account.userName);
        const missingParentUserNames = parentUserNames.filter(name => !existingParentUserNames.includes(name));
        
        console.log('✅ Existing parent accounts:', existingParentUserNames);
        console.log('❌ Missing parent accounts:', missingParentUserNames);
        
        if (missingParentUserNames.length > 0) {
          message.error({
            content: `Các tài khoản phụ huynh chưa tồn tại: ${missingParentUserNames.join(', ')}. Vui lòng tạo tài khoản trước khi import học sinh!`,
            key: 'importStudents'
          });
          return;
        }

        // Transform imported data theo API schema mới - không có parentID
        const studentProfilesData = response.data.map(student => {
          console.log('🔄 Transforming student theo API mới:', student);
          
          const parentUserName = student.parentUserName || student.ParentUserName || student.parent_user_name;
          const parentAccount = existingParentAccounts.find(account => 
            account.userName === parentUserName
          );
          
          if (!parentAccount) {
            console.error(`❌ Parent account not found for: ${parentUserName}`);
            return null;
          }
          
          return {
            studentName: student.studentName || student.StudentName || student.name || student.Name,
            class: student.class || student.Class || student.className || student.ClassName,
            studentAvata: student.studentAvata || student.StudentAvata || student.avatar || student.Avatar || null,
            relationName: student.relationName || student.RelationName || student.relation || student.Relation || 'Con',
            nationality: student.nationality || student.Nationality || student.nation || student.Nation || 'Việt Nam',
            ethnicity: student.ethnicity || student.Ethnicity || student.ethnic || student.Ethnic || 'Kinh',
            birthday: student.birthday || student.Birthday || student.birthDate || student.BirthDate || student.dateOfBirth || student.DateOfBirth || new Date().toISOString(),
            sex: student.sex || student.Sex || student.gender || student.Gender || student.sexType || student.SexType,
            location: student.location || student.Location || student.address || student.Address || student.place || student.Place,
            parentUserName: parentUserName
          };
        }).filter(student => student !== null);

        console.log('📦 Transformed student profiles theo API mới:', studentProfilesData);
        
        // Validate required fields theo API mới
        const validStudentData = studentProfilesData.filter(student => {
          const isValid = student.studentName && 
                         student.class && 
                         student.sex && 
                         student.location && 
                         student.parentUserName;
          
          if (!isValid) {
            console.warn('⚠️ Invalid student data:', student);
          }
          
          return isValid;
        });
        
        console.log(`✅ Valid students: ${validStudentData.length}/${studentProfilesData.length}`);
        
        if (validStudentData.length > 0) {
          // Save via API với schema mới
          await createListStudent(validStudentData);
          console.log('✅ Student profiles saved successfully với API mới');
          
          message.success({ 
            content: `Import thành công ${validStudentData.length} hồ sơ học sinh!`, 
            key: 'importStudents' 
          });
        } else {
          message.warning({ 
            content: "Không có dữ liệu học sinh hợp lệ!", 
            key: 'importStudents' 
          });
        }
        
      } else {
        message.warning({ 
          content: "File được xử lý nhưng không có dữ liệu học sinh nào được trả về!", 
          key: 'importStudents' 
        });
      }
      
      // Always refresh accounts list
      await fetchAccounts();
      
    } catch (err) {
      console.error('❌ Import students error:', err);
      console.error('📄 Error response:', err.response);
      
      let errorMessage = "Import hồ sơ học sinh thất bại!";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = "Định dạng file không hợp lệ hoặc dữ liệu thiếu thông tin bắt buộc!";
      } else if (err.message) {
        errorMessage = `Lỗi: ${err.message}`;
      }
      
      message.error({ 
        content: errorMessage, 
        key: 'importStudents' 
      });
    }
  };

  // Import users from file (only create accounts)
  const handleImportUsers = async (file) => {
    try {
      console.log('📁 User file to upload:', file);
      console.log('📄 File name:', file.name);
      console.log('📊 File type:', file.type);
      console.log('📏 File size:', file.size);

      if (!file) {
        message.error("Vui lòng chọn file!");
        return;
      }

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

      message.loading({ content: 'Đang import tài khoản người dùng...', key: 'importUsers' });

      const response = await getUsersFromFile(file);
      
      console.log('✅ Import users response:', response);
      console.log('📊 Imported users data:', response.data);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('🔍 Analyzing imported users...');
        
        // Log each imported user to see the structure
        response.data.forEach((user, index) => {
          console.log(`👤 User ${index + 1}:`, user);
          console.log(`🔑 User ${index + 1} keys:`, Object.keys(user));
        });
        
        // Transform user data for account creation với đầy đủ thông tin
        const userAccountsData = response.data.map(user => {
          console.log('🔄 Transforming user for account creation:', user);
          
          return {
            userName: user.userName || user.UserName || user.username || user.user || '',
            password: user.password || user.Password || '12345', // Default password
            name: user.name || user.Name || user.fullName || user.FullName || '', // Trường name
            email: user.email || user.Email || user.mail || user.Mail || '', // Trường email
            phone: user.phone || user.Phone || user.phoneNumber || user.PhoneNumber || '', // Trường phone (có thể empty)
            roleName: user.roleName || user.RoleName || user.role || user.Role || 'Parent' // Default to Parent
          };
        });

        console.log('📦 Transformed user accounts data với đầy đủ thông tin:', userAccountsData);
        
        // Filter valid user data - kiểm tra các trường bắt buộc
        const validUsersData = userAccountsData.filter(user => {
          const isValid = user.userName && 
                         user.password && 
                         user.name && 
                         user.email && 
                         user.roleName;
          
          if (!isValid) {
            console.warn('⚠️ Invalid user data - thiếu thông tin bắt buộc:', user);
            console.warn('   userName:', user.userName ? '✅' : '❌ MISSING');
            console.warn('   password:', user.password ? '✅' : '❌ MISSING');
            console.warn('   name:', user.name ? '✅' : '❌ MISSING');
            console.warn('   email:', user.email ? '✅' : '❌ MISSING');
            console.warn('   phone:', user.phone ? '✅' : '⚠️ EMPTY (allowed)');
            console.warn('   roleName:', user.roleName ? '✅' : '❌ MISSING');
          } else {
            console.log('✅ Valid user data:', {
              userName: user.userName,
              name: user.name,
              email: user.email,
              phone: user.phone || 'EMPTY',
              roleName: user.roleName
            });
          }
          
          return isValid;
        });
        
        console.log(`✅ Valid users after filtering: ${validUsersData.length}/${userAccountsData.length}`);
        
        if (validUsersData.length > 0) {
          console.log('📤 Sending payload to createAccounts API:', validUsersData);
          
          // Create user accounts với đầy đủ thông tin theo API schema
          await createAccounts(validUsersData);
          
          message.success({ 
            content: `Import thành công ${validUsersData.length} tài khoản người dùng!`, 
            key: 'importUsers' 
          });
        } else {
          message.warning({ 
            content: "Không có dữ liệu người dùng hợp lệ để tạo tài khoản! Vui lòng kiểm tra các trường: UserName, Password, Name, Email, Role", 
            key: 'importUsers' 
          });
        }
        
      } else {
        message.warning({ 
          content: "File được xử lý nhưng không có dữ liệu người dùng nào được trả về!", 
          key: 'importUsers' 
        });
      }
      
      // Refresh accounts list
      await fetchAccounts();
      
    } catch (err) {
      console.error('❌ Import users error:', err);
      console.error('📄 Error response:', err.response);
      console.error('📄 Error data:', err.response?.data);
      
      let errorMessage = "Import tài khoản người dùng thất bại!";
      
      if (err.response?.status === 400) {
        console.error('🔍 400 Bad Request - có thể do:');
        console.error('   1. Thiếu trường bắt buộc (userName, password, name, email)');
        console.error('   2. Email format không hợp lệ');
        console.error('   3. Trường phone empty (nếu required)');
        console.error('   4. Role không tồn tại trong hệ thống');
        
        if (err.response.data?.message) {
          errorMessage = `Lỗi validation: ${err.response.data.message}`;
        } else if (typeof err.response.data === 'string') {
          errorMessage = `Lỗi từ server: ${err.response.data}`;
        } else {
          errorMessage = "Dữ liệu không hợp lệ! Vui lòng kiểm tra: UserName, Password, Name, Email, Role";
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = `Lỗi: ${err.message}`;
      }
      
      message.error({ 
        content: errorMessage, 
        key: 'importUsers' 
      });
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
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => email || <span style={{color: '#aaa'}}>Chưa có</span>
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
      render: (roleName) => {
        switch (roleName) {
          case "Admin":
            return "Quản Trị Viên";
          case "Parent":
            return "Phụ Huynh";
          case "Nurse":
            return "Y Tá";
          case "Manager":
            return "Quản Lý";
          default:
            return roleName;
        }
      },
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

              {/* Import Users File */}
              <label className="inline-flex items-center cursor-pointer bg-blue-50 border border-blue-200 rounded-2xl px-5 py-2 hover:bg-blue-100 transition gap-2 shadow-md">
                <span className="text-blue-600 font-semibold flex items-center gap-1">
                  <UserOutlined />Thêm nhanh người dùng
                </span>
                <input
                  type="file"
                  accept=".json,.csv,.xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImportUsers(file);
                    }
                    e.target.value = '';
                  }}
                />
              </label>

              {/* Import Students File */}
              <label className="inline-flex items-center cursor-pointer bg-green-50 border border-green-200 rounded-2xl px-5 py-2 hover:bg-green-100 transition gap-2 shadow-md">
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <UserAddOutlined />Thêm nhanh học sinh
                </span>
                <input
                  type="file"
                  accept=".json,.csv,.xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImportStudents(file);
                    }
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
        {/* Modal Thêm tài khoản */}
        <Modal
          title={<span className="font-extrabold text-blue-700 text-xl">Thêm tài khoản mới</span>}
          open={isModalVisible}
          onOk={handleCreateOk}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          width={700}
          okText="Tạo mới"
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
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="userName"
                  label={<span className="font-bold">Tên đăng nhập</span>}
                  rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
                >
                  <Input className="rounded-2xl text-base" placeholder="Nhập tên đăng nhập" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label={<span className="font-bold">Mật khẩu</span>}
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                >
                  <Input.Password 
                    className="rounded-2xl text-base" 
                    placeholder="Nhập mật khẩu"
                  />
                </Form.Item>
              </Col>
            </Row>

            

            <Form.Item
              name="email"
              label={<span className="font-bold">Email</span>}
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input className="rounded-2xl text-base" placeholder="Nhập địa chỉ email" />
            </Form.Item>

       

            <Form.Item
              name="roleName"
              label={<span className="font-bold">Vai trò</span>}
              rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
            >
              <Select placeholder="Chọn vai trò" className="rounded-2xl text-base">
          
                <Option value="Manager">Quản Lý</Option>
                <Option value="Nurse">Y Tá</Option>
                <Option value="Parent">Phụ Huynh</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit Account Modal */}
        <Modal
          title={<span className="font-extrabold text-blue-700 text-xl">Chỉnh sửa tài khoản</span>}
          open={isEditModalVisible}
          onOk={handleUpdateOk}
          onCancel={() => {
            setIsEditModalVisible(false);
            editForm.resetFields();
            setEditingRecord(null);
          }}
          width={700}
          okText="Cập nhật"
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
          <Form form={editForm} layout="vertical" className="space-y-3">
            <Form.Item
              name="userID"
              label={<span className="font-bold">Mã người dùng</span>}
            >
              <Input disabled className="rounded-2xl text-base bg-gray-100" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="userName"
                  label={<span className="font-bold">Tên đăng nhập</span>}
                  rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
                >
                  <Input disabled className="rounded-2xl text-base" placeholder="Nhập tên đăng nhập" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label={<span className="font-bold">Mật khẩu mới</span>}
                >
                  <Input.Password 
                    className="rounded-2xl text-base" 
                    placeholder="Để trống nếu không muốn thay đổi"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="name"
              label={<span className="font-bold">Họ tên đầy đủ</span>}
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input className="rounded-2xl text-base" placeholder="Nhập họ tên đầy đủ" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="font-bold">Email</span>}
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input className="rounded-2xl text-base" placeholder="Nhập địa chỉ email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span className="font-bold">Số điện thoại</span>}
              rules={[
                { pattern: /^[0-9+\-\s()]+$/, message: "Số điện thoại không hợp lệ" }
              ]}
            >
              <Input className="rounded-2xl text-base" placeholder="Nhập số điện thoại (không bắt buộc)" />
            </Form.Item>

            <Form.Item
              name="roleName"
              label={<span className="font-bold">Vai trò</span>}
            >
              <Select disabled className="rounded-2xl text-base">
                <Option value="Admin">Quản Trị Viên</Option>
                <Option value="Manager">Quản Lý</Option>
                <Option value="Nurse">Y Tá</Option>
                <Option value="Parent">Phụ Huynh</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Create Student Profile Modal */}
        <Modal
          title={<span className="font-extrabold text-green-700 text-xl">Tạo hồ sơ học sinh</span>}
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
              background: 'linear-gradient(135deg,#d4ffd4 60%,#a8e6a8 100%)' 
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
              <Col span={24}>
                <Form.Item
                  name="ethnicity"
                  label={<span className="font-bold">Dân tộc</span>}
                  rules={[{ required: true, message: "Vui lòng nhập dân tộc" }]}
                >
                  <Input className="rounded-2xl text-base" placeholder="Nhập dân tộc" />
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
                <Descriptions.Item label={<span className="font-bold">Email</span>}>{selectedAccount.email || <span style={{color: '#aaa'}}>Chưa có</span>}</Descriptions.Item>
                <Descriptions.Item label={<span className="font-bold">Mật khẩu</span>}>********{selectedAccount.password}</Descriptions.Item>
<Descriptions.Item label={<span className="font-bold">Vai trò</span>}>
  {(() => {
    switch (selectedAccount.roleName) {
      case "Admin":
        return "Quản Trị Viên";
      case "Parent":
        return "Phụ Huynh";
      case "Nurse":
        return "Y Tá";
      case "Manager":
        return "Quản Lý";
      default:
        return selectedAccount.roleName;
    }
  })()}
</Descriptions.Item>
                <Descriptions.Item label={<span className="font-bold">Trạng thái</span>}>{selectedAccount.isActive ? <Tag color="green">Kích hoạt</Tag> : <Tag color="red">Khoá</Tag>}</Descriptions.Item>
              </Descriptions>

              {/* Student Information Section for Parent and Admin accounts */}
              {(selectedAccount.roleName === "Parent" || selectedAccount.roleName === "Admin") && (
                <div>
                  <Title level={4} className="text-blue-700 mb-4">
                    {selectedAccount.roleName === "Admin" ? "Thông tin học sinh " : "Thông tin học sinh"}
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
                                key={student.StudentID || student.studentID || student.id || index} 
                                className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 transform hover:-translate-y-1 ${
                                  (selectedStudentDetail?.StudentID || selectedStudentDetail?.studentID || selectedStudentDetail?.id) === 
                                  (student.StudentID || student.studentID || student.id)
                                    ? 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-500 shadow-lg scale-[1.02] ring-2 ring-blue-300' 
                                    : 'bg-white border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-300'
                                }`}
                                size="small"
                                onClick={() => setSelectedStudentDetail(student)}
                              >
                                <div className="flex items-center justify-between p-2">
                                  <div className="flex-1 min-w-0">
                                    <Text className={`font-semibold block truncate text-sm ${
                                      (selectedStudentDetail?.StudentID || selectedStudentDetail?.studentID || selectedStudentDetail?.id) === 
                                      (student.StudentID || student.studentID || student.id)
                                        ? 'text-blue-900' 
                                        : 'text-blue-800'
                                    }`}>
                                      {student.StudentName || student.studentName || student.name || 'N/A'}
                                    </Text>
                                    <Text className="text-gray-600 text-xs">
                                      Lớp: {student.Class || student.class || student.className || 'N/A'}
                                    </Text>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      (selectedStudentDetail?.StudentID || selectedStudentDetail?.studentID || selectedStudentDetail?.id) === 
                                      (student.StudentID || student.studentID || student.id)
                                        ? 'text-blue-700 bg-blue-200'
                                        : 'text-gray-500 bg-gray-100'
                                    }`}>
                                      {student.StudentID || student.studentID || student.id || 'N/A'}
                                    </div>
                                    
                                    {/* Action buttons */}
                                    <div className="flex gap-1 ml-2">
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditStudent(student);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                        title="Chỉnh sửa"
                                      />
                                      <Popconfirm
                                        title="Xóa học sinh này?"
                                        description={`Bạn có chắc chắn muốn xóa học sinh ${student.StudentName || student.studentName || student.name}?`}
                                        onConfirm={(e) => {
                                          e?.stopPropagation();
                                          handleDeleteStudent(student);
                                        }}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okButtonProps={{ danger: true }}
                                      >
                                        <Button
                                          type="text"
                                          size="small"
                                          icon={<DeleteOutlined />}
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                          title="Xóa"
                                        />
                                      </Popconfirm>
                                    </div>
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
                                  {selectedStudentDetail.StudentName || selectedStudentDetail.studentName || selectedStudentDetail.name || 'N/A'}
                                </Title>
                                <Text className="text-gray-600 text-sm">
                                  {selectedStudentDetail.StudentID || selectedStudentDetail.studentID || selectedStudentDetail.id || 'N/A'} - Lớp {selectedStudentDetail.Class || selectedStudentDetail.class || selectedStudentDetail.className || 'N/A'}
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
                                  <span className="text-gray-800">{selectedStudentDetail.Sex || selectedStudentDetail.sex || selectedStudentDetail.gender || 'N/A'}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày sinh">
                                  <span className="text-gray-800">
                                    {(selectedStudentDetail.Birthday || selectedStudentDetail.birthday || selectedStudentDetail.birthDate) 
                                      ? new Date(selectedStudentDetail.Birthday || selectedStudentDetail.birthday || selectedStudentDetail.birthDate).toLocaleDateString('vi-VN') 
                                      : 'N/A'}
                                  </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ">
                                  <span className="text-gray-800">{selectedStudentDetail.Location || selectedStudentDetail.location || selectedStudentDetail.address || 'N/A'}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Quan hệ">
                                  <span className="text-gray-800">{selectedStudentDetail.RelationName || selectedStudentDetail.relationName || selectedStudentDetail.relation || 'N/A'}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Quốc tịch">
                                  <span className="text-gray-800">{selectedStudentDetail.Nationality || selectedStudentDetail.nationality || selectedStudentDetail.nation || 'N/A'}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Dân tộc">
                                  <span className="text-gray-800">{selectedStudentDetail.Ethnicity || selectedStudentDetail.ethnicity || selectedStudentDetail.ethnic || 'N/A'}</span>
                                </Descriptions.Item>
                                {(selectedStudentDetail.StudentAvata || selectedStudentDetail.studentAvata || selectedStudentDetail.avatar) && (
                                  <Descriptions.Item label="Ảnh đại diện">
                                    <span className="text-gray-800">{selectedStudentDetail.StudentAvata || selectedStudentDetail.studentAvata || selectedStudentDetail.avatar}</span>
                                  </Descriptions.Item>
                                )}
                                {selectedAccount.roleName === "Admin" && (
                                  <Descriptions.Item label="Parent ID">
                                    <span className="text-gray-800">{selectedStudentDetail.ParentID || selectedStudentDetail.parentID || selectedStudentDetail.parentId || 'N/A'}</span>
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
                      <div className="mb-4">
                        <UserOutlined className="text-6xl text-gray-300 mb-4" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          {selectedAccount.roleName === "Admin" 
                            ? `Không tìm thấy học sinh nào có ParentID = "${selectedAccount.userID}" trong database.`
                            : `Chưa có học sinh nào có ParentID = "${selectedAccount.userID}" cho tài khoản này.`
                          }
                        </p>
                    
                        {selectedAccount.roleName === "Parent" && (
                          <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700 mb-2">
                              💡 <strong>Hướng dẫn tạo học sinh:</strong>
                            </p>
                            <ul className="text-sm text-green-600 space-y-1">
                              <li>• Nhấn nút <strong>"Tạo hồ sơ học sinh"</strong> ở cột thao tác</li>
                              <li>• Hoặc sử dụng <strong>"Thêm Nhanh Học Sinh"</strong> để thêm nhanh từ file Excel</li>
                              <li>• Học sinh được tạo sẽ có ParentID = "{selectedAccount.userID}"</li>
                              <li>• Dữ liệu sẽ được lưu vào database và hiển thị ngay lập tức</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Edit Student Modal */}
        <Modal
          title={<span className="font-extrabold text-orange-700 text-xl">Chỉnh sửa thông tin học sinh</span>}
          open={editStudentModalVisible}
          onOk={handleUpdateStudent}
          onCancel={() => {
            setEditStudentModalVisible(false);
            editStudentForm.resetFields();
            setEditingStudent(null);
            setUploadedAvatarFile(null);
            setAvatarPreview(null);
          }}
          width={700}
          okText="Cập nhật"
          cancelText="Hủy"
          className="rounded-3xl"
          styles={{ 
            body: { 
              borderRadius: 32, 
              padding: 40, 
              background: 'linear-gradient(135deg,#ffeaa7 60%,#fab1a0 100%)' 
            } 
          }}
        >
          <Form 
            form={editStudentForm} 
            layout="vertical" 
            className="space-y-3"
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
                  label={<span className="font-bold">Ảnh đại diện</span>}
                >
                  <div className="space-y-3">
                    {/* File Upload Option Only for Edit */}
                    <div>
                      <label className="inline-flex items-center cursor-pointer bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2 hover:bg-orange-100 transition gap-2 shadow-sm w-full justify-center">
                        <span className="text-orange-600 font-medium flex items-center gap-2">
                          📸 Chọn ảnh mới từ máy tính
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                                                   onChange={(e) => {
                            const file = e.target.files[0];
                                                       if (file) {
                              handleAvatarUpload(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    
                    {/* Avatar Preview */}
                    {avatarPreview && (
                      <div className="flex justify-center">
                        <div className="relative">
                          <img 
                            src={avatarPreview} 
                            alt="Avatar preview" 
                            className="w-20 h-20 rounded-full object-cover border-2 border-orange-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedAvatarFile(null);
                              setAvatarPreview(null);
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Helper text */}
                    <div className="text-center text-gray-500 text-xs">
                      Chấp nhận: JPG, PNG, GIF. Tối đa 5MB
                    </div>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default AccountList;
   