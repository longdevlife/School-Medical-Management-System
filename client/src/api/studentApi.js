import axiosClient from "./axiosClient";

const studentApi = {
    parent : {
        //GET- lấy danh sách con của phụ huynh 
        getMyChildren: () => {
            return axiosClient.get("parent/get-student-info-by-parent");
        },
    }
};

export default studentApi;
