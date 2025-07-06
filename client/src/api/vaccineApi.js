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

    createByStudentID: (data) => {
      const formData = new FormData();

      formData.append("VaccineID", parseInt(data.VaccineID) || 1);
      formData.append("Dose", parseInt(data.Dose) || 1);
      if (data.Notes) formData.append("Notes", data.Notes);
      if (data.VaccinatedAt) formData.append("VaccinatedAt", data.VaccinatedAt);
      formData.append("StudentID", String(data.StudentID));

      return axiosClient.post("nurse/vaccine/createByStudentID", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // Tạo yêu cầu tiêm chủng theo ClassID
    createByClassID: (data) => {
      const formData = new FormData();

      formData.append("ClassID", String(data.ClassID));
      formData.append("VaccineID", parseInt(data.VaccineID) || 1);
      formData.append("Dose", parseInt(data.Dose) || 1);
      if (data.Notes) formData.append("Notes", data.Notes);
      if (data.VaccinatedAt) formData.append("VaccinatedAt", data.VaccinatedAt);

      return axiosClient.post("nurse/vaccine/createByClassID", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // Cập nhật vaccine record (cho tab "Chờ xác nhận")
    updateByRecordID: (recordID, data) => {
      const formData = new FormData();

      // ✅ Các field theo đúng spec backend (lowercase)
      if (data.dose !== undefined) {
        formData.append("dose", parseInt(data.dose) || 1);
      }
      if (data.vaccineId !== undefined) {
        formData.append("vaccineId", parseInt(data.vaccineId) || 1);
      }
      if (data.studentId) {
        formData.append("studentId", String(data.studentId));
      }
      if (data.vaccinatedAt) {
        formData.append("vaccinatedAt", data.vaccinatedAt);
      }
      if (data.vaccinatorID) {
        formData.append("vaccinatorID", String(data.vaccinatorID));
      }
      if (data.notes) {
        formData.append("notes", data.notes);
      }

      // 🔍 Debug log để kiểm tra data gửi lên
      console.log("🚀 updateByRecordID - recordID:", recordID);
      console.log("🚀 updateByRecordID - data gửi lên:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
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
      if (data.DateTime) formData.append("DateTime", data.DateTime);
      if (data.Status) formData.append("Status", data.Status);
      if (data.FollowUpNotes)
        formData.append("FollowUpNotes", data.FollowUpNotes);
      if (data.FollowUpDate) formData.append("FollowUpDate", data.FollowUpDate);
      if (data.StudentID) formData.append("StudentID", String(data.StudentID));

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
