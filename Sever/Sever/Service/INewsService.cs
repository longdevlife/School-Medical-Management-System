using Sever.DTO.News;
using Sever.Model;
using Sever.Repository;
using Sever.Utilities;

namespace Sever.Service
{
    public interface INewsService
    {
        Task<News> CreateNewsAsync(CreateNewsRequest newNews);
        Task<bool> UpdateNewsAsync(News newNews);
        Task<bool> DeleteNewsByIdAsync(string id);
        Task<News> GetNewsByUserIdAsync(string id);
        Task<List<News>> GetAllNewsAsync();
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
        public Task<News> CreateNewsAsync(CreateNewsRequest newNews)
        {
            if (newNews == null) throw new ArgumentNullException("News Không đúng fomat vui lòng kiểm tra lại");
            var news = new News
            {
                NewsID = GenerateID.GenerateNextId(_newsRepository.)
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

        public async Task<List<News>> GetAllNewsAsync()
        {
            var results = await _newsRepository.GetAllNewsAsync();
            return results;
        }

        public Task<News> GetNewsByUserIdAsync(string id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateNewsAsync(News newNews)
        {
            throw new NotImplementedException();
        }
    }
}
