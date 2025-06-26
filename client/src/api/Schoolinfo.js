import axiosClient from "./axiosClient";

// Lấy thông tin trường học
export const getSchoolInfo = () => {
  return axiosClient.get("/school/get-school-info");
};

// Cập nhật thông tin trường học
export const updateSchoolInfo = (data) => {
  return axiosClient.put("/admin/update-school-info", data);
};
