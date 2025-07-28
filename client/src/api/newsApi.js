import axiosClient from "./axiosClient";

const newsApi = {
  general: {
    getAll: () => axiosClient.get("/news/get-all-news"),
    getById: (newsId) => axiosClient.get(`/news/get-news-by-id/${newsId}`),
    create: (newsData) => axiosClient.post("/news/create-news", newsData),
    update: (newsData) => axiosClient.put("/news/update-news", newsData),
    delete: (newsId) => axiosClient.delete(`/news/delete-news/${newsId}`),
    getActive: async () => {
      try {
        const response = await axiosClient.get("/news/get-active-news");
        return response;
      } catch (error) {
        // Fallback to get all news and filter
        try {
          const allNewsResponse = await newsApi.general.getAll();
          const activeNews = allNewsResponse.data.filter(news => news.Status === 1);
          return { ...allNewsResponse, data: activeNews };
        } catch (fallbackError) {
          throw error;
        }
      }
    },
  },
  manager: {
    getAll: () => axiosClient.get("/manager/get-news-by-manager"),
    create: ({ url, formData }) => axiosClient.post(url, formData),
    update: (formData) => axiosClient.put("/manager/update-news", formData),
    delete: (newsId) => axiosClient.delete(`/manager/delete-news/${newsId}`),
  },
};


// Named exports for compatibility
export const getAllNews = newsApi.general.getAll;
export const getNewsById = newsApi.general.getById;
export const createNews = newsApi.general.create;
export const updateNews = newsApi.general.update;
export const deleteNews = newsApi.general.delete;
export const getActiveNews = newsApi.general.getActive;

export const getNewsByManager = newsApi.manager.getAll;
export const createNewsByManager = newsApi.manager.create;
export const updateNewsByManager = newsApi.manager.update;
export const deleteNewsByManager = newsApi.manager.delete;

export default newsApi;
