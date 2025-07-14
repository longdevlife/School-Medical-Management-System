import axios from "axios";

const BASE_URL = "https://localhost:7040/api/manager";

// API: GET /api/manager/generate-report?fromDate=...&toDate=...
// Trả về: { totalHealthCheckUp, countActiveNews, countInActiveNews }
const reportApi = {
  generateReport: (fromDate, toDate) =>
    axios.get(`${BASE_URL}/generate-report`, {
      params: { fromDate, toDate },
      headers:
        localStorage.getItem("token")
          ? { Authorization: "Bearer " + localStorage.getItem("token") }
          : undefined,
    })
    .then(res => {
      // Đảm bảo trả về đúng object dữ liệu cho dashboard
      if (!res.data || typeof res.data !== "object") {
        return {
          data: {
            totalHealthCheckUp: 0,
            countActiveNews: 0,
            countInActiveNews: 0
          }
        };
      }
      return res;
    })
    .catch(() => ({
      data: {
        totalHealthCheckUp: 0,
        countActiveNews: 0,
        countInActiveNews: 0
      }
    })),
};

export default reportApi;