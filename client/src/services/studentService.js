import api from './api';

export const studentService = {
  // Lấy danh sách học sinh
  getAllStudents: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  // Thêm học sinh mới
  addStudent: async (student) => {
    const response = await api.post('/students', student);
    return response.data;
  },

  // Cập nhật thông tin học sinh
  updateStudent: async (id, student) => {
    const response = await api.put(`/students/${id}`, student);
    return response.data;
  },

  // Xóa học sinh
  deleteStudent: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
}; 