import axiosClient from "./axiosClient";

const medicalEventApi = {
  nurse: {
    getAll: () => {
      return axiosClient.get("nurse/event/getAll");
    },

    // Tạo  sự kiện y tế
    create: (eventData) => {
      console.log("🚀 Raw eventData received in API:", eventData);

      const formData = new FormData();
      Object.keys(eventData).forEach((key) => {
        const value = eventData[key];

        if (value !== null && value !== undefined) {
          if (key === "StudentID" && Array.isArray(value)) {
            value.forEach((id) => {
              formData.append("StudentID", id);
              console.log(`📝 Appending StudentID: ${id}`);
            });
          } else if (key === "Image" && Array.isArray(value)) {
            value.forEach((file) => {
              formData.append("Image", file);
              console.log(`📝 Appending Image:`, file);
            });
          } else {
            formData.append(key, value);
            console.log(`📝 Appending ${key}: ${value}`);
          }
        }
      });

      // Log tất cả FormData entries
      console.log("📋 Final FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      return axiosClient.post("nurse/event/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },

    // Cập nhật sự kiện y tế
    update: (medicalEventID, eventData) => {
      console.log("🔄 Updating medical event:", medicalEventID, eventData);

      const formData = new FormData();

      Object.keys(eventData).forEach((key) => {
        const value = eventData[key];

        if (value !== null && value !== undefined) {
          if (key === "StudentID" && Array.isArray(value)) {
            value.forEach((id) => formData.append("StudentID", id));
          } else if (key === "Image" && Array.isArray(value)) {
            value.forEach((file) => formData.append("Image", file));
          } else {
            formData.append(key, value);
          }
        }
      });

      // Log FormData để debug
      console.log("📝 FormData entries for update:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      return axiosClient.put(`nurse/event/update/${medicalEventID}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
    },

    // Lấy thông tin sự kiện y tế theo medicalEventID
    getByEventID: (medicalEventID) => {
      console.log("📖 Getting medical event by ID:", medicalEventID);

      return axiosClient.get(`nurse/event/getEventId/${medicalEventID}`, {
        timeout: 10000,
      });
    },
    // Lấy thông tin sự kiện y tế theo StudentId
    getByStudentId: (StudentId) => {
      console.log("📖 Getting medical event by StudentId:", StudentId);

      return axiosClient.get(`nurse/event/getByStudentId/${StudentId}`, {
        timeout: 10000,
      });
    },

    // PUT - Thêm ảnh vào medical event theo medicalEventID (giữ ảnh cũ)
    addImage: (medicalEventID, imageFiles) => {
      console.log("🖼️ API AddImage - Medical Event ID:", medicalEventID);
      console.log("🖼️ API AddImage - Image Files:", imageFiles);

      const formData = new FormData();

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
        "🚀 Sending FormData to PUT /nurse/event/addImages/" + medicalEventID
      );

      return axiosClient.put(
        `/nurse/event/addImages/${medicalEventID}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );
    },
  },

  parent: {
    // GET - Lấy tất cả sự kiện y tế của học sinh thuộc phụ huynh đang đăng nhập
    getMedicalEvents: () => {
      return axiosClient.get("/parent/event/getByStudentId");
    },
  },
};

export default medicalEventApi;
