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

    GetMedicinesByStudentID: (studentId) => {
      return axiosClient.get(`/parent/medicine/getByStudentId/${studentId}`);
    },

    // POST: {{HOST}}/api/parent/medicine/create
    CreateMedicine: (medicineData) => {
      console.log("🔄 Parent API Create - Data:", medicineData);

      const formData = new FormData();

      Object.keys(medicineData).forEach((key) => {
        if (medicineData[key] !== null && medicineData[key] !== undefined) {
          // ✅ Handle Images array specially
          if (key === "Images" && Array.isArray(medicineData[key])) {
            // Backend expect multiple 'Image' entries, not 'Images'
            medicineData[key].forEach((file) => {
              formData.append("Image", file); // ← 'Image' không phải 'Images'
            });
            console.log(`📝 Added ${medicineData[key].length} images as 'Image' fields`);
          }
          // ✅ Skip 'Images' key to avoid duplicate
          else if (key !== "Images") {
            // ✅ Handle default values for optional fields
            if (key === 'Instructions' || key === 'Notes') {
              formData.append(key, medicineData[key] || '');
            } else if (key === 'Status') {
              formData.append(key, medicineData[key] || 'Chờ xử lý');
            } else {
              formData.append(key, medicineData[key]);
            }
            console.log(`📝 FormData: ${key} = ${medicineData[key]}`);
          }
        }
      });

      console.log("🚀 Sending Parent FormData to POST /parent/medicine/create");

      return axiosClient.post("/parent/medicine/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
    },
    // PUT: {{HOST}}/api/parent/medicine/update
    UpdateMedicine: (data) => {
      const formData = new FormData();
      if (data.MedicineName) formData.append('MedicineName', data.MedicineName);
      if (data.Quantity) formData.append('Quantity', data.Quantity);
      if (data.Dosage) formData.append('Dosage', data.Dosage);
      if (data.Instructions) formData.append('Instructions', data.Instructions);
      if (data.Notes) formData.append('Notes', data.Notes);

      // Append images if any
      if (data.Images && data.Images.length > 0) {
        data.Images.forEach((file) => {
          formData.append('Image', file);
        });
      }

      return axiosClient.put('/parent/medicine/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
  },
};

export default medicineApi;