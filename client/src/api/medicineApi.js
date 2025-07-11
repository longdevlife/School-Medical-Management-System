import axiosClient from "./axiosClient";
const medicineApi = {
  nurse: {
    // GET - Lấy DANH SÁCH THUỐC TỪ PHỤ HUYNH GỬI
    getAll: () => {
      return axiosClient.get("/nurse/medicine/getAll");
    },

    // POST - Tạo thuốc cho học sinh
    create: (medicineData) => {
      console.log(
        "🚀 medicineApi.nurse.create called with data:",
        medicineData
      );

      const formData = new FormData();
      Object.keys(medicineData).forEach((key) => {
        if (medicineData[key] !== null && medicineData[key] !== undefined) {
          // Xử lý riêng trường Image
          if (key === "Image" && Array.isArray(medicineData[key])) {
            if (medicineData[key].length > 0) {
              console.log(
                `📁 Adding ${medicineData[key].length} images to FormData`
              );
              medicineData[key].forEach((file, index) => {
                if (file instanceof File) {
                  formData.append("Image", file);
                  console.log(
                    `📎 Added Image[${index}]: ${file.name} (${file.size} bytes)`
                  );
                } else {
                  console.warn(`⚠️ Invalid image at index ${index}:`, file);
                }
              });
            } else {
              console.log("📷 No images to upload");
            }
          }
          // Xử lý các field khác
          else {
            formData.append(key, medicineData[key]);
            console.log(`📝 Added field: ${key} = ${medicineData[key]}`);
          }
        }
      });

      // Debug FormData contents
      console.log("📋 Final FormData contents:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      console.log("🚀 Sending POST request to /nurse/medicine/create");
      return axiosClient.post("/nurse/medicine/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
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

    // PUT - Thêm ảnh vào medicine theo medicineId AddImangeByMedicine
    addImage: (medicineId, imageFiles, studentID) => {
      console.log("🖼️ API AddImage - Medicine ID:", medicineId);
      console.log("🖼️ API AddImage - Student ID:", studentID);
      console.log("🖼️ API AddImage - Image Files:", imageFiles);

      const formData = new FormData();

      // Thêm StudentID
      if (studentID) {
        formData.append("StudentID", studentID);
        console.log(`📝 Added StudentID: ${studentID}`);
      }

      // Thêm từng file ảnh vào FormData
      imageFiles.forEach((file) => {
        formData.append("Image", file);
        console.log(`📁 Added image: ${file.name} (${file.size} bytes)`);
      });

      // Debug FormData contents
      console.log("📋 AddImage FormData contents:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      console.log(
        "🚀 Sending FormData to PUT /nurse/medicine/addImage/" + medicineId
      );

      return axiosClient.put(
        `/nurse/medicine/addImage/${medicineId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );
    },
  },
  parent: {
    // Backend sẽ trả về TẤT CẢ medicines của parent, frontend sẽ filter
    getMedicinesByParentId: () => {
      return axiosClient.get(`/parent/medicine/getByParentId`);
    },

    // POST - Tạo medicine mới
    createMedicine: (data) => {
      console.log("🚀 medicineApi.createMedicine called with data:", {
        ...data,
        ImagesCount: data.Images?.length || 0,
        StudentID: data.StudentID,
      });

      // Validate required fields
      if (!data.MedicineName?.trim()) {
        throw new Error("MedicineName is required");
      }
      if (!data.Quantity?.trim()) {
        throw new Error("Quantity is required");
      }
      if (!data.Dosage?.trim()) {
        throw new Error("Dosage is required");
      }
      if (!data.StudentID?.trim()) {
        throw new Error("StudentID is required");
      }

      const formData = new FormData();

      // Thêm các trường bắt buộc
      formData.append("MedicineName", data.MedicineName.trim());
      formData.append("Quantity", data.Quantity.trim());
      formData.append("Dosage", data.Dosage.trim());
      formData.append("StudentID", data.StudentID.trim());

      // Thêm các trường tùy chọn
      if (data.Instructions !== undefined) {
        formData.append("Instructions", data.Instructions.trim() || "");
      }
      if (data.Notes !== undefined) {
        formData.append("Notes", data.Notes.trim() || "");
      }

      // Debug FormData trước khi gửi
      console.log("📋 FormData contents:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // ✅ Xử lý hình ảnh - Backend nhận IFormFile[] Image
      if (data.Images && Array.isArray(data.Images) && data.Images.length > 0) {
        console.log("🖼️ Adding images to FormData:", data.Images.length);
        data.Images.forEach((file, index) => {
          if (file instanceof File) {
            formData.append("Image", file);
            console.log(
              `📎 Added Image[${index}]: ${file.name} (${file.size} bytes)`
            );
          } else {
            console.warn(`⚠️ Invalid image at index ${index}:`, file);
          }
        });
      } else if (data.Image && data.Image instanceof File) {
        formData.append("Image", data.Image);
        console.log("📎 Added single Image:", data.Image.name);
      } else {
        console.log("📷 No images to upload");
      }

      console.log("🚀 Sending POST request to /parent/medicine/create");
      return axiosClient.post("/parent/medicine/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
    },

    // Backend cho phép update các thuốc có trạng thái chưa xử lý theo MedicineID
    updateMedicine: (data) => {
      const medicineId = data.MedicineID;

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
      if (data.Instructions !== undefined)
        formData.append("Instructions", data.Instructions);
      if (data.Notes !== undefined) formData.append("Notes", data.Notes);

      // Xử lý hình ảnh - đảm bảo khớp với định dạng api của nurse
      if (data.Images && Array.isArray(data.Images) && data.Images.length > 0) {
        data.Images.forEach((file) => {
          formData.append("Image", file);
        });
      } else if (data.Image) {
        formData.append("Image", data.Image);
      }

      // api/parent/medicine/update
      return axiosClient.put(`/parent/medicine/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
    },
  },
};

export default medicineApi;
