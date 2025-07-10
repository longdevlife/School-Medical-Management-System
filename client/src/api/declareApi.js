
import axiosClient from './axiosClient';

const declareApi = {
  parent: {
    // GET - Lấy thông tin hồ sơ sức khỏe theo parent ID (trả về tất cả health profiles của các con)
    getHealthProfile: () => {
      return axiosClient.get('/parent/healthProfile/getByParentId');
    },

    // PUT - Cập nhật thông tin hồ sơ sức khỏe
    updateHealthProfile: (data) => {
      return axiosClient.put('/parent/healthProfile/declare', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
};

export default declareApi;