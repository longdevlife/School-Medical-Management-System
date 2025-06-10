import api from './api';

export const accountService = {
  // Lấy danh sách tài khoản
  getAllAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },

  // Thêm tài khoản mới
  addAccount: async (account) => {
    const response = await api.post('/accounts', account);
    return response.data;
  },

  // Cập nhật thông tin tài khoản
  updateAccount: async (id, account) => {
    const response = await api.put(`/accounts/${id}`, account);
    return response.data;
  },

  // Xóa tài khoản
  deleteAccount: async (id) => {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  },
}; 