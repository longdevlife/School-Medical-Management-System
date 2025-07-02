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

      console.log(
        "🚀 Sending FormData to PUT /nurse/medicine/update/" + medicineId
      );

      return axiosClient.put(`/nurse/medicine/update/${medicineId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
    },
  },
  parent: {
    // Backend sẽ trả về TẤT CẢ medicines của parent, frontend sẽ filter
    getMedicinesByParentId: () => {
      console.log(`🚀 Parent API - Đang lấy TẤT CẢ thuốc của parent`);
      return axiosClient.get(`/parent/medicine/getByParentId`);
    },
    
    // POST - Tạo medicine mới
    createMedicine: (data) => {
      console.log("🚀 Parent API - Đang tạo thuốc mới:", data);
      
      const formData = new FormData();
      
      // Thêm các trường bắt buộc
      formData.append("MedicineName", data.MedicineName);
      formData.append("Quantity", data.Quantity);
      formData.append("Dosage", data.Dosage);
      formData.append("StudentID", data.StudentID);
      
      // Thêm các trường tùy chọn
      if (data.Instructions !== undefined) formData.append("Instructions", data.Instructions);
      if (data.Notes !== undefined) formData.append("Notes", data.Notes);
      
      // Xử lý hình ảnh - đảm bảo khớp với định dạng API của nurse
      if (data.Images && Array.isArray(data.Images) && data.Images.length > 0) {
        data.Images.forEach(file => {
          formData.append("Image", file);
        });
      } else if (data.Image) {
        formData.append("Image", data.Image);
      }
      
      return axiosClient.post("/parent/medicine/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000
      });
    },
    
    // PUT - Cập nhật medicine - Phụ huynh KHÔNG được phép cập nhật Status
    // Backend cho phép update các thuốc có trạng thái chưa xử lý theo MedicineID
    updateMedicine: (data) => {
      const medicineId = data.MedicineID;
      console.log("🚀 Parent API - Đang cập nhật thuốc ID:", medicineId, data);
      
      if (!medicineId) {
        throw new Error("MedicineID là bắt buộc để cập nhật thuốc");
      }
      
      const formData = new FormData();
      
      // Gửi MedicineID để backend biết thuốc nào cần update
      formData.append("MedicineID", medicineId);
      
      // Thêm các trường thông tin thuốc được phép cập nhật
      if (data.MedicineName) formData.append("MedicineName", data.MedicineName);
      if (data.Quantity) formData.append("Quantity", data.Quantity);
      if (data.Dosage) formData.append("Dosage", data.Dosage);
      if (data.Instructions !== undefined) formData.append("Instructions", data.Instructions);
      if (data.Notes !== undefined) formData.append("Notes", data.Notes);
      
      // Xử lý hình ảnh - đảm bảo khớp với định dạng api của nurse
      if (data.Images && Array.isArray(data.Images) && data.Images.length > 0) {
        data.Images.forEach(file => {
          formData.append("Image", file);
        });
      } else if (data.Image) {
        formData.append("Image", data.Image);
      }
      
      // KHÔNG gửi Status - Phụ huynh không được phép thay đổi trạng thái
      
      // api/parent/medicine/update
      return axiosClient.put(`/parent/medicine/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000
      });
    },
    

  },
};

export default medicineApi;
