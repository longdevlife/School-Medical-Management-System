import axiosClient from "./axiosClient";

const vaccineApi = {
  nurse: {
    // Lấy tất cả vaccine records
    getAll: () => {
      return axiosClient.get("nurse/vaccine/getAll");
    },

    // Lấy danh sách đã xác nhận
    getConfirm: () => {
      return axiosClient.get("nurse/vaccine/getConfirm");
    },

    // Lấy danh sách từ chối
    getDenied: () => {
      return axiosClient.get("nurse/vaccine/getDenied");
    },

    // Lấy danh sách chưa phản hồi
    getNotResponse: () => {
      return axiosClient.get("nurse/vaccine/getNotResponse");
    },

    // Tạo yêu cầu tiêm chủng theo StudentID
    createByStudentID: (data) => {
      const formData = new FormData();

      // Thêm các field theo đúng API documentation
      formData.append("VaccineID", data.VaccineID || "1");
      formData.append("Dose", data.Dose || "1");
      formData.append("Notes", data.Notes || "");
      formData.append("StudentID", data.StudentID);

      return axiosClient.post("nurse/vaccine/createByStudentID", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // Tạo yêu cầu tiêm chủng theo ClassID
    createByClassID: (data) => {
      const formData = new FormData();

      // Thêm các field theo đúng API documentation
      formData.append("ClassID", data.ClassID);
      formData.append("VaccineID", data.VaccineID || "1");
      formData.append("Dose", data.Dose || "1");
      formData.append("Notes", data.Notes || "");

      return axiosClient.post("nurse/vaccine/createByClassID", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // Cập nhật vaccine record
    updateByRecordID: (recordID, data) => {
      const formData = new FormData();

      // Thêm các field theo đúng API documentation
      formData.append("Dose", data.Dose || "");
      formData.append("DateTime", data.DateTime || "");
      formData.append("Notes", data.Notes || "");
      formData.append("Status", data.Status || "");
      formData.append("VaccinatedAt", data.VaccinatedAt || "");
      formData.append("StudentID", data.StudentID || "");
      formData.append("VaccineID", data.VaccineID || "");
      formData.append("VaccinatorID", data.VaccinatorID || "");

      // Thêm file ảnh nếu có
      if (data.Image && Array.isArray(data.Image)) {
        data.Image.forEach((file) => {
          if (file instanceof File) {
            formData.append(`Image`, file);
          }
        });
      }

      return axiosClient.put(
        `nurse/vaccine/updateByRecordID/${recordID}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },

    // Cập nhật sau khi tiêm
    updateAfterByRecordID: (recordID, data) => {
      const formData = new FormData();

      // Thêm các field theo đúng API documentation
      formData.append("DateTime", data.DateTime || "");
      formData.append("Status", data.Status || "");
      formData.append("FollowUpNotes", data.FollowUpNotes || "");
      formData.append("FollowUpDate", data.FollowUpDate || "");
      formData.append("StudentID", data.StudentID || "");

      // Thêm file ảnh nếu có
      if (data.Image && Array.isArray(data.Image)) {
        data.Image.forEach((file) => {
          if (file instanceof File) {
            formData.append(`Image`, file);
          }
        });
      }

      return axiosClient.put(
        `nurse/vaccine/updateAfterByRecordID/${recordID}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
  },
};

export default vaccineApi;
