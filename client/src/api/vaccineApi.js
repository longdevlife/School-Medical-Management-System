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

    // Cập nhật vaccine record
    updateByRecordID: (recordID, data) => {
      const formData = new FormData();

      if (data.Dose) formData.append("Dose", parseInt(data.Dose) || 1);
      if (data.DateTime) formData.append("DateTime", data.DateTime);
      if (data.Notes) formData.append("Notes", data.Notes);
      if (data.Status) formData.append("Status", data.Status);
      if (data.VaccinatedAt) formData.append("VaccinatedAt", data.VaccinatedAt);
      if (data.StudentID) formData.append("StudentID", String(data.StudentID));
      if (data.VaccineID)
        formData.append("VaccineID", parseInt(data.VaccineID) || 1);
      if (data.ClassID) formData.append("ClassID", parseInt(data.ClassID) || 1);

      if (data.VaccinatorID) {
        formData.append("VaccinatorID", String(data.VaccinatorID));
      } else if (data.skipVaccinatorID !== true) {
        try {
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const userID =
            currentUser.username ||
            currentUser.userID ||
            currentUser.id ||
            formData.append("VaccinatorID", String(userID));
          console.log("✅ VaccinatorID được gửi:", userID);
        } catch (e) {
          formData.append("VaccinatorID", "nurse");
          console.log("✅ VaccinatorID fallback = nurse");
        }
      } else {
        console.log("⚠️ Bỏ qua VaccinatorID theo yêu cầu");
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
