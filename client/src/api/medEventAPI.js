import axiosClient from "./axiosClient";

const medEventApi = {
    //GET - lay danh sach su kien y te theo studentId
    GetEventByStudentId: (studentId) => {
        return axiosClient.get(`parent/event/getByStudentId/${studentId}`)
    }
};

export default medEventApi;