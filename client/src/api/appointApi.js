import axiosClient from "./axiosClient";

const appointApi = {
  parent: {
    // GET - Lấy danh sách health checkups (bao gồm appointment) theo parent ID
    getHealthCheckupsByParentId: (parentId) => {
      return axiosClient.get(`parent/get-all-health-check-up-by-parent/${parentId}`);
    },

    // PUT - Xác nhận appointment
    confirmAppointment: (appointmentData) => {
      return axiosClient.put("parent/confirm-appointment", appointmentData);
    },

    // PUT - Từ chối appointment
    deniedAppointment: (appointmentData) => {
      return axiosClient.put("parent/denied-appointment", appointmentData);
    },

    // GET - Lấy thông tin user hiện tại (để có parentId)
    getCurrentUserInfo: () => {
       return axiosClient.get("/user/get-user-info");
    },
  },
};

export default appointApi;
