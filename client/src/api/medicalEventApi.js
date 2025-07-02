import axiosClient from "./axiosClient";

const medicalEventApi = {
  parent: {
    // GET - Lấy tất cả sự kiện y tế của học sinh thuộc phụ huynh đang đăng nhập
    getMedicalEvents: () => {
      console.log('🚀 Parent API - Đang lấy sự kiện y tế của học sinh');
      return axiosClient.get('/parent/event/getByStudentId');
    }
  },
  
  nurse: {
    // API cho y tá sẽ được thêm sau khi có yêu cầu
  }
};

export default medicalEventApi; 