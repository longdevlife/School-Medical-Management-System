import axiosClient from "./axiosClient";

const medicalEventApi = {
  nurse: {
    // Lấy tất cả sự kiện y tế
    getAllMedicalEvents: () => {
      return axiosClient.get("nurse/event/getAll");
    },

    // Tạo  sự kiện y tế
    create: (eventData) => {
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
  },
};

export default medicalEventApi;
