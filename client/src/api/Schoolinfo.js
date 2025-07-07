import axiosClient from "./axiosClient";

export const getSchoolInfo = () => {
  console.log('Calling getSchoolInfo API...');
  return axiosClient.get("/school/get-school-info")
    .then(response => {
      console.log('getSchoolInfo response:', response);
      return response;
    })
    .catch(error => {
      console.error('getSchoolInfo error:', error);
      throw error;
    });
};

// Cập nhật thông tin trường học
export const updateSchoolInfo = async (data) => {
  try {
    console.log('updateSchoolInfo called with data:', data);
    
    // Extract files and other parameters
    const { Logo, LogoGifs, ...queryParams } = data;
    
    // Build query string
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `/admin/update-school-info?${queryString}`;
    
    console.log('API call URL:', url);
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Backend expects both Logo and LogoGifs fields
    if (Logo) {
      formData.append('Logo', Logo);
      console.log('FormData Logo contents:', Logo);
    } else {
      const defaultBlob = new Blob(['default'], { type: 'text/plain' });
      const defaultFile = new File([defaultBlob], 'default.txt', { type: 'text/plain' });
      formData.append('Logo', defaultFile);
    }
    
    if (LogoGifs) {
      formData.append('LogoGifs', LogoGifs);
      console.log('FormData LogoGifs contents:', LogoGifs);
    } else {
      const defaultBlob = new Blob(['default'], { type: 'text/plain' });
      const defaultFile = new File([defaultBlob], 'default.txt', { type: 'text/plain' });
      formData.append('LogoGifs', defaultFile);
    }
    
    const response = await axiosClient.put(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('updateSchoolInfo error:', error);
    throw error;
  }
};
