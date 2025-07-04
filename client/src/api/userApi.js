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
