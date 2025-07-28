import axiosClient from "./axiosClient";

// API: GET /api/manager/generate-report?fromDate=...&toDate=...
// Trả về: { totalHealthCheckUp, countActiveNews, countInActiveNews }
const reportApi = {
  generateReport: (fromDate, toDate) =>
    axiosClient
      .get("/manager/generate-report", {
        params: { fromDate, toDate },
      })
      .then((res) => {
        // Đảm bảo trả về đúng object dữ liệu cho dashboard
        if (!res.data || typeof res.data !== "object") {
          return {
            data: {
              totalHealthCheckUp: 0,
              countActiveNews: 0,
              countInActiveNews: 0,
            },
          };
        }
        return res;
      })
      .catch(() => ({
        data: {
          totalHealthCheckUp: 0,
          countActiveNews: 0,
          countInActiveNews: 0,
        },
      })),
};

export default reportApi;
