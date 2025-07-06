import axiosClient from "./axiosClient";

export const getSchoolInfo = () => {
  console.log('Calling getSchoolInfo API...');
  return axiosClient.get("/school/get-school-info")
    .then(response => {
      console.log('getSchoolInfo response:', response);
      return response;
    })
    .catch(error => {
      console.error('getSchoolInfo error:', error);
      throw error;
    });
};

// Cập nhật thông tin trường học
export const updateSchoolInfo = (params) => {
  // Tạo query string từ params object
  const queryParams = new URLSearchParams({
    SchoolID: params.SchoolID || "school-001",
    Name: params.Name || "",
    Address: params.Address || "",
    Hotline: params.Hotline || "",
    Email: params.Email || ""
  });

  // Tạo FormData cho multipart request
  const formData = new FormData();
  
  // Logo là bắt buộc, nếu không có thì tạo một file rỗng
  if (params.Logo) {
    formData.append('Logo', params.Logo);
  } else {
    // Tạo một file rỗng để tránh lỗi validation
    const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' });
    formData.append('Logo', emptyFile);
  }

  const url = `/admin/update-school-info?${queryParams.toString()}`;
  console.log("API call URL:", url);
  console.log("FormData contents:", formData.get('Logo'));
  
  return axiosClient.put(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
