import api from './api';

export const medicineService = {
  // Lấy danh sách thuốc
  getAllMedicines: async () => {
    const response = await api.get('/medicines');
    return response.data;
  },

  // Thêm thuốc mới
  addMedicine: async (medicine) => {
    const response = await api.post('/medicines', medicine);
    return response.data;
  },

  // Cập nhật thông tin thuốc
  updateMedicine: async (id, medicine) => {
    const response = await api.put(`/medicines/${id}`, medicine);
    return response.data;
  },

  // Xóa thuốc
  deleteMedicine: async (id) => {
    const response = await api.delete(`/medicines/${id}`);
    return response.data;
  },
}; 