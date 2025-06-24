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
        Task<List<HealthCheckUp>> GetHealthCheckupsByYearAsync(DateTime dateTime);
        Task<List<HealthCheckUp>> GetHealthCheckUpsDeniedAsync();
        Task<List<HealthCheckUp>> GetHealthCheckUpsConfirmAsync();
        Task<List<HealthCheckUp>> GetHealthCheckUpsNotResponseAsync();
        Task<bool> UpdateStatus(HealthCheckUp healthCheckup, string status);
        string NewID();

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
        public async Task<List<HealthCheckUp>> GetHealthCheckupsByYearAsync(DateTime dateTime)
        {
            return await _context.HealthCheckUp
                .Where(h => h.CheckDate != null && h.CheckDate.Value.Year == dateTime.Year)
                .ToListAsync();
        }
        public async Task<List<HealthCheckUp>> GetHealthCheckUpsDeniedAsync()
        {
            return await _context.HealthCheckUp
                .Where(h => h.Status == "Từ chối")
                .ToListAsync();
        }

        public async Task<List<HealthCheckUp>> GetHealthCheckUpsConfirmAsync()
        {
            return await _context.HealthCheckUp
                .Where(h => h.Status == "Đã xác nhận")
                .ToListAsync();
        }

        public async Task<List<HealthCheckUp>> GetHealthCheckUpsNotResponseAsync()
        {
            return await _context.HealthCheckUp
                .Where(h => h.Status == "Chờ phản hồi")
                .ToListAsync();
        }
        public async Task<bool> UpdateStatus(HealthCheckUp healthCheckup, string status)
        {
            healthCheckup.Status = status;
            _context.HealthCheckUp.Update(healthCheckup);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }
        public string NewID()
        {
            var lastHealthCheckup = _context.HealthCheckUp
                                     .OrderByDescending(h => h.HealthCheckUpID)
                                     .FirstOrDefault();

            return GenerateID.GenerateNextId(lastHealthCheckup.HealthCheckUpID, "HCU", 4);
        }
    }
}