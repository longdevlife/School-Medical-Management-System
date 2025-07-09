import axiosClient from "./axiosClient";

const healthProfileApi = {
  nurse: {
    // GET - Lấy tất cả hồ sơ sức khỏe học sinh
    getAll: () => {
      console.log("🔄 Fetching all health profiles...");
      return axiosClient.get("/nurse/healthProfile/getAll");
    },
  },
};

export default healthProfileApi;
