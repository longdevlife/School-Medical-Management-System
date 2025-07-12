using Sever.DTO.News;
using Sever.Model;
using Sever.Repository;
using Sever.Utilities;

namespace Sever.Service
{
    public interface INewsService
    {
        Task<News> CreateNewsAsync(CreateNews newNews, string userId);
        Task<bool> UpdateNewsAsync(UpdateNews newNews);
        Task<bool> DeleteNewsByIdAsync(string id);
        Task<List<GetNewRespone>> GetNewsByUserIdAsync(string id);
        Task<List<GetNewRespone>> GetAllNewsForHomePage();
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
        public async Task<News> CreateNewsAsync(CreateNews newNews, string userId)
        {
            if (newNews == null) throw new ArgumentNullException("News Không đúng fomat vui lòng kiểm tra lại");
            var news = new News
            {
                NewsID = _newsRepository.GetNewID().Result,
                Title = newNews.Title,
                Summary = newNews.Summary,
                Body = newNews.Body,
                DateTime = DateTime.Now,
                UserID = userId,
                Status = true
            };

            try
            {
                var results = _newsRepository.CreateNewsAsync(news);
                foreach (var item in newNews.Image)
                {
                    var imgUp = await _filesService.UploadNewsImageByAsync(item, news.NewsID);
                    if (imgUp == null)
                    {
                        throw new ArgumentException("Lưu ảnh thất bại");
                    }
                }
                return news;
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
            if (results.Count <= 0)
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

        public async Task<List<GetNewRespone>> GetAllNewsForHomePage()
        {
            var newsResponse = new List<GetNewRespone>();
            var listNews = await _newsRepository.GetAllNewsAsync();
            if(listNews == null) { throw new ArgumentNullException("Không có tin tức nào để hiển thị"); }
            foreach (var item in listNews)
            {
                var listImage = await _filesService.GetImageByNewsIdAsync(item.NewsID);
                newsResponse.Add(new GetNewRespone()
                {
                    NewsID = item.NewsID,
                    Title = item.Title,
                    DateTime = item.DateTime,
                    Summary = item.Summary,
                    Body = item.Body,
                    Image = listImage.Select(i => i.FileLink).ToList(),
                });

            }
            if (listNews == null) throw new ArgumentNullException("Không tìm thấy tin tức người dùng này đã đăng");
            return newsResponse;
        }

        public async Task<List<GetNewRespone>> GetNewsByUserIdAsync(string id)
        {
            var newsResponse = new List<GetNewRespone>();
            var listNews = await _newsRepository.GetNewsByUserIdAsync(id);
            foreach (var item in listNews)
            {
                var listImage = await _filesService.GetImageByNewsIdAsync(item.NewsID);
                newsResponse.Add(new GetNewRespone()
                {
                    NewsID = item.NewsID,
                    Title = item.Title,
                    DateTime = item.DateTime,
                    Summary = item.Summary,
                    Body = item.Body,
                    Image = listImage.Select(i => i.FileLink).ToList(),
                    Status = item.Status,
                });

            }
            if (listNews == null) throw new ArgumentNullException("Không tìm thấy tin tức người dùng này đã đăng");
            return newsResponse;
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
                await _filesService.DeleteFileAsync(item.FileLink);
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
