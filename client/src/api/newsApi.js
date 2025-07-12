import axiosClient from "./axiosClient";

// Get all news
export const getAllNews = async () => {
  try {
    console.log('Calling API /news/get-all-news');
    const response = await axiosClient.get('/news/get-all-news');
    console.log('Get all news success:', response);
    return response;
  } catch (error) {
    console.error('Get all news error:', error);
    throw error;
  }
};

// Get news by ID
export const getNewsById = async (newsId) => {
  try {
    console.log('Calling API /news/get-news-by-id with ID:', newsId);
    const response = await axiosClient.get(`/news/get-news-by-id/${newsId}`);
    console.log('Get news by ID success:', response);
    return response;
  } catch (error) {
    console.error('Get news by ID error:', error);
    throw error;
  }
};

// Create new news
export const createNews = async (newsData) => {
  try {
    console.log('Calling API /news/create-news with data:', newsData);
    const response = await axiosClient.post('/news/create-news', newsData);
    console.log('Create news success:', response);
    return response;
  } catch (error) {
    console.error('Create news error:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Update news
export const updateNews = async (newsData) => {
  try {
    console.log('Calling API /news/update-news with data:', newsData);
    const response = await axiosClient.put('/news/update-news', newsData);
    console.log('Update news success:', response);
    return response;
  } catch (error) {
    console.error('Update news error:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Delete news
export const deleteNews = async (newsId) => {
  try {
    console.log('Calling API /news/delete-news with ID:', newsId);
    const response = await axiosClient.delete(`/news/delete-news/${newsId}`);
    console.log('Delete news success:', response);
    return response;
  } catch (error) {
    console.error('Delete news error:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Get active news only
export const getActiveNews = async () => {
  try {
    console.log('Calling API /news/get-active-news');
    const response = await axiosClient.get('/news/get-active-news');
    console.log('Get active news success:', response);
    return response;
  } catch (error) {
    console.error('Get active news error:', error);
    // Fallback to get all news and filter
    try {
      const allNewsResponse = await getAllNews();
      const activeNews = allNewsResponse.data.filter(news => news.Status === 1);
      return { ...allNewsResponse, data: activeNews };
    } catch (fallbackError) {
      console.error('Fallback get active news error:', fallbackError);
      throw error;
    }
  }
};

// Get news by manager
export const getNewsByManager = async () => {
  try {
    const response = await axiosClient.get('/manager/get-news-by-manager');
    return response;
  } catch (error) {
    throw error;
  }
};

// Create news by manager (POST /api/manager/create-news?Title=...&Summary=...&Body=..., multipart/form-data)
export const createNewsByManager = async ({ url, formData }) => {
  try {
    // url có thể là /api/manager/create-news?Title=...&Summary=...&Body=...
    const response = await axiosClient.post(url, formData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update news by manager (PUT /api/manager/update-news, multipart/form-data)
export const updateNewsByManager = async (formData) => {
  try {
    const response = await axiosClient.put('/manager/update-news', formData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete news by manager (DELETE /api/manager/delete-news/{id})
export const deleteNewsByManager = async (newsId) => {
  try {
    const response = await axiosClient.delete(`/manager/delete-news/${newsId}`);
    return response;
  } catch (error) {
    throw error;
  }
};
