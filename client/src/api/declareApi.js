import axiosClient from "./axiosClient";

const declareApi = {
    parent: {
        // PUT - Lấy và cập nhật health profile
        declareHealthProfile: (studentID, data = {}) => {
            console.log(`Parent API - đang gọi health profile cho học sinh: ${studentID}`, data);
            return axiosClient.put(`/parent/declare-health-profile`, {
                studentID,
                ...data
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
       }
    }
};

export default declareApi;