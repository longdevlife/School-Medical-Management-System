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

// Create student profile
export const createStudentProfile = async (studentData) => {
  try {
    console.log('Calling API /admin/create-student-profile with data:', studentData);
    console.log('Data stringified:', JSON.stringify(studentData, null, 2));
    
    const response = await axiosClient.post('/admin/create-student-profile', studentData);
    console.log('Create student profile success:', response);
    return response;
  } catch (error) {
    console.error('Create student profile error:', error);
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

