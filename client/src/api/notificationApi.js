import axiosClient from "./axiosClient";

const notificationApi = {
  // Get notifications for current authenticated user
  getNotificationsByUserId: () => {
    const url = `/user/get-notify-by-user-id`;
    return axiosClient.get(url);
  },
};

export default notificationApi;
