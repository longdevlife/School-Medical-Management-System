import axiosClient from "./axiosClient";

// GET current user info
export const getUserInfo = () => {
  console.log('📡 Calling API /user/get-user-info');
  
  return axiosClient.get('/user/get-user-info')
    .then(response => {
      console.log('✅ Get user info success:', response);
      return response;
    })
    .catch(error => {
      console.error('❌ Get user info error:', error);
      console.error('📄 Error response:', error.response);
      console.error('📄 Error data:', error.response?.data);
      console.error('📄 Error status:', error.response?.status);
      console.error('📄 Error message:', error.message);
      
      throw error;
    });
};

// UPDATE current user info
export const updateCurrentUserInfo = (userData) => {
  console.log('📤 Calling API /user/update-user-info with data:', userData);
  console.log('📤 Data stringified:', JSON.stringify(userData, null, 2));
  
  return axiosClient.put('/user/update-user-info', userData)
    .then(response => {
      console.log('✅ Update user info success:', response);
      return response;
    })
    .catch(error => {
      console.error('❌ Update user info error:', error);
      console.error('📄 Error response:', error.response);
      console.error('📄 Error data:', error.response?.data);
      console.error('📄 Error status:', error.response?.status);
      console.error('📄 Error message:', error.message);
      
      // Log the exact request that failed
      console.error('🔍 Failed request URL:', error.config?.url);
      console.error('🔍 Failed request method:', error.config?.method);
      console.error('🔍 Failed request data:', error.config?.data);
      console.error('🔍 Failed request headers:', error.config?.headers);
      
      // Log detailed validation errors if available
      if (error.response?.status === 400 && error.response?.data?.errors) {
        console.error('📋 Validation errors breakdown:');
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          const messageArray = Array.isArray(messages) ? messages : [messages];
          console.error(`  ❌ ${field}: ${messageArray.join(', ')}`);
        });
      }
      
      throw error;
    });
};

// GET user profile (extended info if available)
export const getUserProfile = () => {
  console.log('📡 Calling API /user/get-profile');
  
  return axiosClient.get('/user/get-profile')
    .then(response => {
      console.log('✅ Get user profile success:', response);
      return response;
    })
    .catch(error => {
      console.error('❌ Get user profile error:', error);
      throw error;
    });
};

// UPDATE user profile (extended info)
export const updateUserProfile = (profileData) => {
  console.log('📤 Calling API /user/update-profile with data:', profileData);
  
  return axiosClient.put('/user/update-profile', profileData)
    .then(response => {
      console.log('✅ Update user profile success:', response);
      return response;
    })
    .catch(error => {
      console.error('❌ Update user profile error:', error);
      throw error;
    });
};

// CHANGE password with old and new password
export const changePassword = (passwordData) => {
  console.log('📤 Calling API /auth/change-password');
  // Don't log password data for security
  console.log('📤 Password change request structure:', {
    oldPass: passwordData.oldPass ? '***' : 'empty',
    newPass: passwordData.newPass ? '***' : 'empty'
  });
  
  return axiosClient.post('/auth/change-password', passwordData)
    .then(response => {
      console.log('✅ Change password success:', response);
      return response;
    })
    .catch(error => {
      console.error('❌ Change password error:', error);
      console.error('📄 Error response:', error.response);
      console.error('📄 Error data:', error.response?.data);
      console.error('📄 Error status:', error.response?.status);
      console.error('📄 Error message:', error.message);
      
      // Log the exact request that failed
      console.error('🔍 Failed request URL:', error.config?.url);
      console.error('🔍 Failed request method:', error.config?.method);
      console.error('🔍 Failed request headers:', error.config?.headers);
      
      // Log validation errors if available
      if (error.response?.status === 400 && error.response?.data?.errors) {
        console.error('📋 Password validation errors:');
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          const messageArray = Array.isArray(messages) ? messages : [messages];
          console.error(`  ❌ ${field}: ${messageArray.join(', ')}`);
        });
      }
      
      throw error;
    });
};

// GET user settings/preferences
export const getUserSettings = () => {
  console.log('📡 Calling API /user/get-settings');
  
  return axiosClient.get('/user/get-settings')
    .then(response => {
      console.log('✅ Get user settings success:', response);
      return response;
    })
    .catch(error => {
      console.error('❌ Get user settings error:', error);
      throw error;
    });
};

// UPDATE user settings/preferences
export const updateUserSettings = (settingsData) => {
  console.log('📤 Calling API /user/update-settings with data:', settingsData);
  
  return axiosClient.put('/user/update-settings', settingsData)
    .then(response => {
      console.log('✅ Update user settings success:', response);
      return response;
    })
    .catch(error => {
      console.error('❌ Update user settings error:', error);
      throw error;
    });
};

// UPLOAD user avatar
export const uploadUserAvatar = (file) => {
  console.log('📤 Calling API /user/upload-avatar with file:', file.name);
  
  const formData = new FormData();
  formData.append('avatar', file);
  
  return axiosClient.post('/user/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      console.log('✅ Upload avatar success:', response);
      return response;
    })
    .catch(error => {
      console.error('❌ Upload avatar error:', error);
      throw error;
    });
};

// DELETE user avatar
export const deleteUserAvatar = () => {
  console.log('📤 Calling API /user/delete-avatar');
  
  return axiosClient.delete('/user/delete-avatar')
    .then(response => {
      console.log('✅ Delete avatar success:', response);
      return response;
    })
    .catch(error => {
      console.error('❌ Delete avatar error:', error);
      throw error;
    });
};
