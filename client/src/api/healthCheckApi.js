import axiosClient from "./axiosClient";

const healthCheckApi = {
  parent: {
    // GET - Lấy danh sách health checkup của con theo parent ID
    getHealthCheckupsByParentId: (parentId) => {
      return axiosClient.get(`/parent/get-all-health-check-up-by-parent/${parentId}`);
    },

    // GET - Lấy thông tin students của parent để có parentID
    getStudentsByParent: () => {
      return axiosClient.get("/parent/get-student-info-by-parent");
    },

    // GET - Lấy thông tin user hiện tại để có parentId
    getCurrentUserInfo: () => {
      return axiosClient.get("/user/get-user-info");
    },

    // PUT - Xác nhận health checkup
    confirmHealthCheckup: (healthCheckupData) => {
      return axiosClient.put("/parent/confirm-health-check-up", healthCheckupData);
    },

    // PUT - Từ chối health checkup
    denyHealthCheckup: (healthCheckupData) => {
      return axiosClient.put("/parent/denied-health-check-up", healthCheckupData);
    }
  },

};

export default healthCheckApi;
