import axiosClient from "./axiosClient";
const medicineApi = {
  nurse: {
    // GET - Lấy DANH SÁCH THUỐC TỪ PHỤ HUYNH GỬI
    getAll: () => {
      return axiosClient.get("/nurse/medicine/getAll");
    },

    // POST - Tạo thuốc cho học sinh
    create: (medicineData) => {
      const formData = new FormData();
      Object.keys(medicineData).forEach((key) => {
        if (medicineData[key] !== null && medicineData[key] !== undefined) {
          formData.append(key, medicineData[key]);
        }
      });
      return axiosClient.post("/nurse/medicine/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },

    // GET - Search thuốc theo studentId
    getByStudentId: (studentId) => {
      return axiosClient.get(`/nurse/medicine/getByStudentId/${studentId}`);
    },

    // PUT - Cập nhật thuốc theo medicineId
    update: (medicineId, updateData) => {
      console.log("🔄 API Update - Medicine ID:", medicineId);
      console.log("🔄 API Update - Raw Data:", updateData);

      // ✅ QUAY LẠI FormData như Postman test thành công
      const formData = new FormData();
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== null && updateData[key] !== undefined) {
          // Xử lý array Image
          if (key === "Image" && Array.isArray(updateData[key])) {
            if (updateData[key].length > 0) {
              updateData[key].forEach((file) => {
                formData.append("Image", file);
              });
            }
          } else {
            formData.append(key, updateData[key]);
          }
          console.log(`📝 FormData: ${key} = ${updateData[key]}`);
        }
      });

      console.log("🚀 Sending FormData to PUT /nurse/medicine/update/" + medicineId);

      return axiosClient.put(`/nurse/medicine/update/${medicineId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
    },

    // DELETE - Xóa thuốc theo medicineId
    delete: (medicineId) => {
      return axiosClient.delete(`/nurse/medicine/delete/${medicineId}`);
    },
  },
};

export default medicineApi;
