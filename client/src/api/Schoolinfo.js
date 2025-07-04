import axiosClient from "./axiosClient";

// Lấy thông tin trường học
export const getSchoolInfo = () => {
  return axiosClient.get("/school/get-school-info");
};

// Cập nhật thông tin trường học
export const updateSchoolInfo = (data) => {
  const formData = new FormData();

  formData.append("SchoolID", data.SchoolID || "abc");
  formData.append("Name", data.Name || data.name || "");
  formData.append("Address", data.Address || data.address || "");
  formData.append("Hotline", data.Hotline || data.hotline || "");
  formData.append("Email", data.Email || data.email || "");

  // Nếu có ảnh logo
  if (data.Logo) {
    formData.append("Logo", data.Logo);
  }

  return axiosClient.put("/admin/update-school-info", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
