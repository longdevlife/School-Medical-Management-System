using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;
using Sever.Utilities;

namespace Sever.Repository
{
    public interface INewsRepository
    {
        Task<News> CreateNewsAsync(News news);
        Task<bool> UpdateNewsAsync(News news);
        Task<bool> DeleteNewsAsync(News news);
        Task<List<News>> GetAllNewsAsync();
        Task<List<News>> GetNewsByUserIdAsync(string userId);
        Task<News> GetNewsByIdAsync(string id);
        Task<string> GetCurrentNewsID(string id);
    }
    public class NewsRepository : INewsRepository
    {
        private readonly DataContext _context;
        public NewsRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<News> CreateNewsAsync(News news)
        {
            _context.Add(news);
            await _context.SaveChangesAsync();
            return news;
        }

        public async Task<bool> DeleteNewsAsync(News news)
        {
            news.Status = false;
            _context.News.Update(news);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<List<News>> GetAllNewsAsync()
        {
            var result = await _context.News.ToListAsync();
            if (result.Count > 0)
            {
                return result;
            }
            return null;
        }

        public async Task<bool> UpdateNewsAsync(News news)
        {
            _context.Update(news);
            var result = await _context.SaveChangesAsync();
            return result >= 0;
        }
        public async Task<List<News>> GetNewsByUserIdAsync(string userId)
        {
            var listNews = await _context.News.Where(n => n.UserID == userId).ToListAsync();
            if (listNews.Count() > 0)
            {
                return listNews;
            }
            return null;
        }
        public async Task<News> GetNewsByIdAsync(string id)
        {
            var result = await _context.News.FirstOrDefaultAsync(n => n.NewsID == id);
            if (result == null)
                return null;
            return result;
        }
        public async Task<string> GetCurrentNewsID(string id)
        {
            var crurrentNews = await _context.News.OrderByDescending(n => n.NewsID).FirstOrDefaultAsync();
            if(crurrentNews == null)
            {
                throw new ArgumentException("Tải News ID thất bại");
            }
            string result = GenerateID.GenerateNextId(crurrentNews.NewsID, "NW", 4);
            return result;
        }
    }
}
