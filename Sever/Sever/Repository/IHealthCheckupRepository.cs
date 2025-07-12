using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;
using Sever.Utilities;

namespace Sever.Repository
{
    public interface IHealthCheckupRepository
    {
        Task<HealthCheckUp> CreateHealthCheckupAsync(HealthCheckUp healthCheckup);
        Task<bool> UpdateHealthCheckupAsync(HealthCheckUp healthCheckup);
        Task<bool> DeleteHealthCheckupAsync(string id);
        Task<HealthCheckUp> GetHealthCheckupByIdAsync(string id);
        Task<List<HealthCheckUp>> GetAllHealthCheckupsAsync();
        Task<List<HealthCheckUp>> GetHealthCheckupsByStudentIdAsync(string studentId);
        Task<List<HealthCheckUp>> GetHealthCheckupsByYearAsync(int year);
        Task<List<HealthCheckUp>> GetHealthCheckUpsDeniedAsync();
        Task<List<HealthCheckUp>> GetHealthCheckUpsConfirmAsync();
        Task<List<HealthCheckUp>> GetHealthCheckUpsNotResponseAsync();
        Task<bool> UpdateStatus(HealthCheckUp healthCheckup, string status);
        Task<HealthCheckUp> GetHealthCheckUpByIdAsync(string id);
        string NewID();
        Task<int> CountHealthCheckUpsAsync(DateTime fromDate, DateTime toDate);
        Task<int> CountConfirmHealthCheckUpsAsync(DateTime fromDate, DateTime toDate);
        Task<int> CountDeninedHealthCheckUpsAsync(DateTime fromDate, DateTime toDate);
        Task<int> CountNotResponseHealthCheckUpsAsync(DateTime fromDate, DateTime toDate);
    }

    public class HealthCheckupRepository : IHealthCheckupRepository
    {
        private readonly DataContext _context;
        public HealthCheckupRepository(DataContext context)
        {
            _context = context;
        }
        public async Task<HealthCheckUp> CreateHealthCheckupAsync(HealthCheckUp healthCheckup)
        {
            await _context.HealthCheckUp.AddAsync(healthCheckup);
            await _context.SaveChangesAsync();
            return healthCheckup;
        }
        public async Task<bool> UpdateHealthCheckupAsync(HealthCheckUp healthCheckup)
        {
            _context.HealthCheckUp.Update(healthCheckup);
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<bool> DeleteHealthCheckupAsync(string id)
        {
            var healthCheckup = await GetHealthCheckupByIdAsync(id);
            if (healthCheckup == null) return false;
            _context.HealthCheckUp.Remove(healthCheckup);
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<HealthCheckUp> GetHealthCheckupByIdAsync(string id)
        {
            return await _context.HealthCheckUp.FirstOrDefaultAsync(h => h.HealthCheckUpID == id);
        }
        public async Task<List<HealthCheckUp>> GetAllHealthCheckupsAsync()
        {
            return await _context.HealthCheckUp.ToListAsync();
        }
        public async Task<List<HealthCheckUp>> GetHealthCheckupsByStudentIdAsync(string studentId)
        {
            return await _context.HealthCheckUp
                .Where(h => h.StudentID == studentId)
                .ToListAsync();
        }
        public async Task<List<HealthCheckUp>> GetHealthCheckupsByYearAsync(int Year)
        {
            return await _context.HealthCheckUp
                .Where(h => h.CheckDate.Value.Year == Year)
                .ToListAsync();
        }
        public async Task<List<HealthCheckUp>> GetHealthCheckUpsDeniedAsync()
        {
            return await _context.HealthCheckUp
                .Where(h => h.Status == "Từ chối" && h.CheckDate >= DateTime.Now)
                .ToListAsync();
        }

        public async Task<List<HealthCheckUp>> GetHealthCheckUpsConfirmAsync()
        {
            return await _context.HealthCheckUp
                .Where(h => h.Status == "Đã xác nhận" && h.CheckDate >= DateTime.Now)
                .ToListAsync();
        }

        public async Task<List<HealthCheckUp>> GetHealthCheckUpsNotResponseAsync()
        {
            return await _context.HealthCheckUp
                .Where(h => h.Status == "Chờ xác nhận" && h.CheckDate >= DateTime.Now)
                .ToListAsync();
        }
        public async Task<bool> UpdateStatus(HealthCheckUp healthCheckup, string status)
        {
            healthCheckup.Status = "Hoàn thành";
            _context.HealthCheckUp.Update(healthCheckup);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public string NewID()
        {
            var lastHealthCheckup = _context.HealthCheckUp
                                     .OrderByDescending(h => h.HealthCheckUpID)
                                     .FirstOrDefault();
            if (lastHealthCheckup == null)
            {
                return "HC0001";
            }
            return GenerateID.GenerateNextId(lastHealthCheckup.HealthCheckUpID, "HC", 4);
        }

        public async Task<HealthCheckUp> GetHealthCheckUpByIdAsync(string id)
        {
            return await _context.HealthCheckUp.FirstOrDefaultAsync(h => h.HealthCheckUpID == id);
        }
        public async Task<int> CountHealthCheckUpsAsync(DateTime fromDate, DateTime toDate)
        {
            return await _context.HealthCheckUp
                .Where(h => h.CheckDate >= fromDate && h.CheckDate <= toDate)
                .CountAsync();
        }
        public async Task<int> CountConfirmHealthCheckUpsAsync(DateTime fromDate, DateTime toDate)
        {
            return await _context.HealthCheckUp
                .Where(h => h.CheckDate >= fromDate && h.CheckDate <= toDate && h.Status == "Đã xác nhận")
                .CountAsync();
        }
        public async Task<int> CountDeninedHealthCheckUpsAsync(DateTime fromDate, DateTime toDate)
        {
            return await _context.HealthCheckUp
                .Where(h => h.CheckDate >= fromDate && h.CheckDate <= toDate && h.Status == "Từ chối")
                .CountAsync();
        }
        public async Task<int> CountNotResponseHealthCheckUpsAsync(DateTime fromDate, DateTime toDate)
        {
            return await _context.HealthCheckUp
                .Where(h => h.CheckDate >= fromDate && h.CheckDate <= toDate && h.Status == "Chờ xác nhận")
                .CountAsync();
        }
    }
}
