import axiosClient from "./axiosClient";

const medicineApi = {
  nurse: {
    // GET - Lấy medicine theo studentId
    GetMedicinesByStudentID: (studentId) => {
      return axiosClient.get(`nurse/medicine/getByStudentId/${studentId}`);
    },
    // POST - Tạo medicine
    CreateMedicine: (medicineData) => {
      const formData = new FormData();
      Object.keys(medicineData).forEach((key) => {
        if (medicineData[key] !== null && medicineData[key] !== undefined) {
          formData.append(key, medicineData[key]);
        }
      });
      return axiosClient.post("nurse/medicine/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  },

  parent: {
    // GET - Lấy medicine theo studentId
    getMedicinesByStudentId: (studentId) => {
      console.log(`Đang lấy thuốc cho học sinh: ${studentId}`);
      return axiosClient.get(`parent/medicine/getByStudentId/${studentId}`);
    },
    
    // GET - Lấy tất cả medicine của parent
    /*getAllMedicines: () => {
      console.log("Đang lấy tất cả thuốc của phụ huynh");
      return axiosClient.get("parent/medicine/getAll");
    },*/

    // POST - Tạo medicine mới
    createMedicine: (data) => {
      console.log("Đang tạo thuốc mới:", data);
      
      const formData = new FormData();
      
      // Thêm các trường bắt buộc
      formData.append("MedicineName", data.MedicineName);
      formData.append("Quantity", data.Quantity);
      formData.append("Dosage", data.Dosage);
      formData.append("StudentID", data.StudentID);
      
      // Thêm các trường tùy chọn
      if (data.Instructions !== undefined) formData.append("Instructions", data.Instructions);
      if (data.Notes !== undefined) formData.append("Notes", data.Notes);
      
      // Xử lý hình ảnh - đổi tên field từ Images thành Image để khớp với backend
      if (data.Images && Array.isArray(data.Images) && data.Images.length > 0) {
        data.Images.forEach(file => {
          formData.append("Image", file);
        });
      }
      
      return axiosClient.post("parent/medicine/create", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    },
    
    // PUT - Cập nhật medicine - Phụ huynh KHÔNG được phép cập nhật Status
    updateMedicine: (data) => {
      console.log("Đang cập nhật thuốc:", data);
      
      const formData = new FormData();
      
      // ID thuốc là bắt buộc để xác định thuốc cần cập nhật
      if (!data.MedicineID) {
        console.error("MedicineID là bắt buộc khi cập nhật thuốc");
        return Promise.reject(new Error("MedicineID là bắt buộc"));
      }
      
      formData.append("MedicineID", data.MedicineID);
      
      // Thêm các trường thông tin thuốc được phép cập nhật
      if (data.MedicineName) formData.append("MedicineName", data.MedicineName);
      if (data.Quantity) formData.append("Quantity", data.Quantity);
      if (data.Dosage) formData.append("Dosage", data.Dosage);
      if (data.Instructions !== undefined) formData.append("Instructions", data.Instructions);
      if (data.Notes !== undefined) formData.append("Notes", data.Notes);
      if (data.StudentID) formData.append("StudentID", data.StudentID);
      
      // Xử lý hình ảnh - đổi tên field từ Images thành Image để khớp với backend
      if (data.Images && Array.isArray(data.Images) && data.Images.length > 0) {
        data.Images.forEach(file => {
          formData.append("Image", file);
        });
      }
      
      // KHÔNG gửi Status - Phụ huynh không được phép thay đổi trạng thái
      
      return axiosClient.put("parent/medicine/update", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    },
    
    // Thêm chức năng xóa cache thuốc lưu local nếu cần
    clearLocalMedicineCacheIfNeeded: (cacheKey) => {
      if (cacheKey && localStorage.getItem(cacheKey)) {
        localStorage.removeItem(cacheKey);
        console.log(`Đã xóa cache thuốc: ${cacheKey}`);
      }
    }
  },
};

export default medicineApi;