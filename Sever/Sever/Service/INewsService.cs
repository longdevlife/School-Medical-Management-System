using Sever.DTO.News;
using Sever.Model;
using Sever.Repository;
using Sever.Utilities;

namespace Sever.Service
{
    public interface INewsService
    {
        Task<News> CreateNewsAsync(CreateNews newNews);
        Task<bool> UpdateNewsAsync(UpdateNews newNews);
        Task<bool> DeleteNewsByIdAsync(string id);
        Task<List<News>> GetNewsByUserIdAsync(string id);
        Task<List<GetNews>> GetAllNewsAsync();
    }
    public class NewsService : INewsService

    {
        private readonly INewsRepository _newsRepository;
        private readonly IFilesService _filesService;
        public NewsService(INewsRepository newsRepository,
                           IFilesService filesService)
        {
            _newsRepository = newsRepository;
            _filesService = filesService;
        }
        public Task<News> CreateNewsAsync(CreateNews newNews)
        {
            if (newNews == null) throw new ArgumentNullException("News Không đúng fomat vui lòng kiểm tra lại");
            var news = new News
            {
                NewsID = "NW222"
            };

            try
            {
                var results = _newsRepository.CreateNewsAsync(news);
                foreach (var item in newNews.Image)
                {
                    _filesService.UploadNewsImageByAsync(item, news.NewsID);
                }
                return results;
            }
            catch (Exception ex)
            {
                throw new ArgumentException("Tạo news thất bại", ex.Message);
            }
        }

        public async Task<bool> DeleteNewsByIdAsync(string id)
        {
            var news = await _newsRepository.GetNewsByIdAsync(id);
            var result = await _newsRepository.DeleteNewsAsync(news);
            return result;
        }

        public async Task<List<GetNews>> GetAllNewsAsync()
        {
            var results = await _newsRepository.GetAllNewsAsync();
            if(results.Count <= 0)
            {
                throw new ArgumentException("không có tin tức nào để hiển thị");
            }
            List<GetNews> lisNews = new List<GetNews>();
            foreach (var item in results)
            {
                var listImage = await _filesService.GetImageByNewsIdAsync(item.NewsID);
                lisNews.Add(new GetNews()
                {
                    Title = item.Title,
                    DateTime = item.DateTime,
                    Summary = item.Summary,
                    Body = item.Body,
                    Image = listImage
                });
            }
            return lisNews;
        }

        public async Task<List<News>> GetNewsByUserIdAsync(string id)
        {
            var listNews = await _newsRepository.GetNewsByUserIdAsync(id); ;
            if (listNews == null) throw new ArgumentNullException("Không tìm thấy tin tức người dùng này đã đăng");
            return listNews;
        }

        public async Task<bool> UpdateNewsAsync(UpdateNews newNews)
        {
            var news = await _newsRepository.GetNewsByIdAsync(newNews.NewsID);
            news.Title = newNews.Title;
            news.Summary = newNews.Summary;
            news.Body = newNews.Body;
            bool uploadImg = true;
            var listImage = await _filesService.GetImageByNewsIdAsync(news.NewsID);
            foreach (var item in listImage)
            {
                await _filesService.DeleteFileByIdAsync(news.NewsID);
            }
            foreach (var item in newNews.Image)
            {
                try
                {
                    await _filesService.UploadNewsImageByAsync(item, news.NewsID);
                }
                catch
                {
                    uploadImg = false;
                    throw new ArgumentException("Lưu ảnh thất bại");
                }
            }
            if (uploadImg || news != null)
            {
                return true;
            }
            return false;
        }
    }
}
