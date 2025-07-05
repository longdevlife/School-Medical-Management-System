using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;
using Sever.Utilities;

namespace Sever.Repository
{
    public interface IHealthProfileRepository
    {
        Task<HealthProfile> GetHealthProfileByStudentID(string studentId);
        Task<bool> UpdateHealthProfile(HealthProfile healthProfile);
        Task<bool> AddHealthProfile(HealthProfile healthProfile);
        Task<string> NewID();
        Task<List<HealthProfile>> GetAllAsync();

    }

    public class HealthProfileRepository : IHealthProfileRepository
    {
        private readonly DataContext _context;
        public HealthProfileRepository(DataContext dataContext)
        {
            _context = dataContext;
        }

        public async Task<HealthProfile> GetHealthProfileByStudentID(string studentId)
        {
            return await _context.HealthProfile
                .FirstOrDefaultAsync(h => h.StudentID == studentId);
        }

        public async Task<bool> UpdateHealthProfile(HealthProfile healthProfile)
        {
            _context.HealthProfile.Update(healthProfile);
            var result = await _context.SaveChangesAsync();
            return result > 0;

        }
        public async Task<bool> AddHealthProfile(HealthProfile healthProfile)
        {
            await _context.HealthProfile.AddAsync(healthProfile);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<string> NewID()
        {
            var healthProfile = await _context.HealthProfile
                .OrderByDescending(h => h.HealthProfileID)
                .FirstOrDefaultAsync();
            if (healthProfile == null)
            {
                return "HP0001";
            }
            var newid = GenerateID.GenerateNextId(healthProfile.HealthProfileID, "HP", 4);
            return newid;
        }

        public async Task<List<HealthProfile>> GetAllAsync()
        {
            return await _context.HealthProfile.ToListAsync();
        }

    }
}
