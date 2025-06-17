import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Thay đổi URL theo backend của bạn

export const login = async (username, password) => {
  try {
    console.log('Checking sample account...');
    // Kiểm tra tài khoản mẫu
    const sampleAccount = JSON.parse(localStorage.getItem('sampleAccount'));
    console.log('Sample account:', sampleAccount);
    
    if (sampleAccount && sampleAccount.username === username && sampleAccount.password === password) {
      console.log('Using sample account');
      const userData = {
        token: 'sample-token',
        username: sampleAccount.username,
        fullName: sampleAccount.fullName,
        email: sampleAccount.email,
        role: sampleAccount.role
      };
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }

    console.log('No sample account match, trying API...');
    // Nếu không phải tài khoản mẫu, gọi API
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error in auth service:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  console.log('Current user from localStorage:', user);
  return user ? JSON.parse(user) : null;
}; 