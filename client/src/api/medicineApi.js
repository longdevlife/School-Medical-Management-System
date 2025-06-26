import axiosClient from "./axiosClient";

const medicineApi = {
  nurse: {
    // GET - Lấy medicine theo studentId
    GetMedicinesByStudentID: (studentId) => {
      return axiosClient.get(`/nurse/medicine/getByStudentId/${studentId}`);
    },
    // POST - Tạo medicine
    CreateMedicine: (medicineData) => {
      const formData = new FormData();
      Object.keys(medicineData).forEach((key) => {
        if (medicineData[key] !== null && medicineData[key] !== undefined) {
          formData.append(key, medicineData[key]);
        }
      });
      return axiosClient.post("/Medicine", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  },
};

export default medicineApi;
