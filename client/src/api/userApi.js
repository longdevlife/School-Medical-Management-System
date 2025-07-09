import axiosClient from "./axiosClient";

// Tạo nhiều tài khoản
export const createAccounts = (data) => {
  return axiosClient.post("/admin/create-accounts", data);
};

// Cập nhật thông tin user
export const updateUserInfo = (data) => {
  return axiosClient.put("/admin/update-user-info", data);
};

// Xóa user theo userName
export const deleteUser = (userName) => {
  // Đảm bảo đúng kiểu dữ liệu backend nhận (UserName viết hoa chữ U)
  return axiosClient.delete(`/admin/delete-user`, { data: { UserName: userName } });
};

// Lấy danh sách user từ file (upload file)
export const getUsersFromFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosClient.post("/admin/get-users-from-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Lấy danh sách tất cả tài khoản
export const getAllAccounts = async () => {
  const res = await axiosClient.get("/admin/get-all-account");
  // Trả về đúng dữ liệu backend trả về (object hoặc array)
  return res;
};

// Mở khoá tài khoản (active account)
export const activeAccount = (userName) => {
  // userName là chuỗi, gửi đúng định dạng backend yêu cầu
  return axiosClient.put("/admin/active-account", userName, {
    headers: { 'Content-Type': 'application/json' }
  });
};

// CREATE student profile with JSON payload
export const createStudentProfile = (studentData) => {
  console.log('📤 Calling API /admin/create-student-profile with JSON data:', studentData);
  console.log('📤 Data stringified:', JSON.stringify(studentData, null, 2));
  
  return axiosClient.post('/admin/create-student-profile', studentData, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      console.log('✅ Create student profile success:', response);
      return response;
    })
    .catch(error => {
      console.error('❌ Create student profile error:', error);
      console.error('📄 Error response:', error.response);
      console.error('📄 Error data:', error.response?.data);
      console.error('📄 Error status:', error.response?.status);
      console.error('📄 Error message:', error.message);
      
      // Log the exact request that failed
      console.error('🔍 Failed request URL:', error.config?.url);
      console.error('🔍 Failed request method:', error.config?.method);
      console.error('🔍 Failed request data:', error.config?.data);
      console.error('🔍 Failed request headers:', error.config?.headers);
      
      // Log detailed validation errors if available
      if (error.response?.status === 400 && error.response?.data?.errors) {
        console.error('📋 Validation errors breakdown:');
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          const messageArray = Array.isArray(messages) ? messages : [messages];
          console.error(`  ❌ ${field}: ${messageArray.join(', ')}`);
        });
      }
      
      throw error;
    });
};

// Create list of students
export const createListStudent = async (studentArray) => {
  try {
    console.log('Calling API /admin/create-list-student with data:', studentArray);
    console.log('Data stringified:', JSON.stringify(studentArray, null, 2));
    
    const response = await axiosClient.post('/admin/create-list-student', studentArray);
    console.log('Create list student success:', response);
    return response;
  } catch (error) {
    console.error('Create list student error:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    console.error('Error details:', error.response?.data?.errors);
    
    console.log('Failed request URL:', error.config?.url);
    console.log('Failed request data:', JSON.stringify(error.config?.data, null, 2));
    console.log('Failed request headers:', error.config?.headers);
    
    throw error;
  }
};

// Import students from file
export const getStudentsFromFile = async (file) => {
  try {
    console.log('Calling API /admin/get-students-from-file with file:', file.name);
    
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await axiosClient.post("/admin/get-students-from-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    console.log('Import students from file success:', response);
    console.log('Imported students count:', response.data?.length || 0);
    
    return response;
  } catch (error) {
    console.error('Import students from file error:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    throw error;
  }
};

// Get all students (if API exists)
export const getAllStudents = async () => {
  try {
    console.log('Calling API /admin/get-all-students');
    const response = await axiosClient.get('/admin/get-all-students');
    console.log('Get all students success:', response);
    return response;
  } catch (error) {
    console.error('Get all students error:', error);
    throw error;
  }
};

// Get student info by parent
export const getStudentInfoByParent = async (parentUserName) => {
  try {
    console.log('Calling API /admin/get-student-info-by-parent with parent:', parentUserName);
    
    const response = await axiosClient.post('/admin/get-student-info-by-parent', 
      JSON.stringify(parentUserName),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Get student info by parent success:', response);
    return response;
  } catch (error) {
    console.error('Get student info by parent error:', error);
    throw error;
  }
};

// Update student profile
export const updateStudentProfile = async (studentData) => {
  try {
    console.log('Calling API /admin/update-student-profile with data:', studentData);
    
    const response = await axiosClient.put('/admin/update-student-profile', studentData);
    console.log('Update student profile success:', response);
    return response;
  } catch (error) {
    console.error('Update student profile error:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    
    throw error;
  }
};

// Delete student profile
export const deleteStudentProfile = async (studentId) => {
  try {
    console.log('Calling API /admin/delete-student-profile with ID:', studentId);
    
    const response = await axiosClient.delete(`/admin/delete-student-profile/${studentId}`);
    console.log('Delete student profile success:', response);
    return response;
  } catch (error) {
    console.error('Delete student profile error:', error);
    console.error('Error response:', error.response);
    
    throw error;
  }
};

// Get account statistics
export const getAccountStatistics = async () => {
  try {
    console.log('Calling API /admin/get-account-statistics');
    const response = await axiosClient.get('/admin/get-account-statistics');
    console.log('Get account statistics success:', response);
    return response;
  } catch (error) {
    console.error('Get account statistics error:', error);
    throw error;
  }
};

// Batch delete accounts
export const batchDeleteAccounts = async (userNames) => {
  try {
    console.log('Calling API /admin/batch-delete-accounts with users:', userNames);
    
    const response = await axiosClient.post('/admin/batch-delete-accounts', {
      userNames: userNames
    });
    
    console.log('Batch delete accounts success:', response);
    return response;
  } catch (error) {
    console.error('Batch delete accounts error:', error);
    console.error('Error response:', error.response);
    
    throw error;
  }
};

// Search accounts with filters
export const searchAccounts = async (filters) => {
  try {
    console.log('Calling API /admin/search-accounts with filters:', filters);
    
    const response = await axiosClient.post('/admin/search-accounts', filters);
    console.log('Search accounts success:', response);
    return response;
  } catch (error) {
    console.error('Search accounts error:', error);
    throw error;
  }
};

// Create user account
export const createUserAccount = async (userData) => {
  try {
    console.log('Calling API /admin/create-user-account with data:', userData);
    console.log('Data stringified:', JSON.stringify(userData, null, 2));
    
    const response = await axiosClient.post('/admin/create-user-account', userData);
    console.log('Create user account success:', response);
    return response;
  } catch (error) {
    console.error('Create user account error:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    console.error('Error details:', error.response?.data?.errors);
    
    console.log('Failed request URL:', error.config?.url);
    console.log('Failed request data:', JSON.stringify(error.config?.data, null, 2));
    console.log('Failed request headers:', error.config?.headers);
    
    throw error;
  }
};

// Create list of users (batch create)
export const createListUsers = async (userArray) => {
  try {
    console.log('Calling API /admin/create-list-users with data:', userArray);
    console.log('Data stringified:', JSON.stringify(userArray, null, 2));
    
    const response = await axiosClient.post('/admin/create-list-users', userArray);
    console.log('Create list users success:', response);
    return response;
  } catch (error) {
    console.error('Create list users error:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    console.error('Error details:', error.response?.data?.errors);
    
    console.log('Failed request URL:', error.config?.url);
    console.log('Failed request data:', JSON.stringify(error.config?.data, null, 2));
    console.log('Failed request headers:', error.config?.headers);
    
    throw error;
  }
};

