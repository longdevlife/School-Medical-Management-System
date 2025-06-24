using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;

namespace Sever.Repository
{
    public interface IHealthProfileRepository
    {
        Task<HealthProfile> GetHealthProfileByStudentID(string studentId);
    }

    public class HealthProfileRepository : IHealthProfileRepository
    {
        private readonly IHealthProfileRepository _healthProfileRepository;
        private readonly DataContext _context;
        public HealthProfileRepository(IHealthProfileRepository healthProfileRepository, DataContext dataContext)
        {
            _healthProfileRepository = healthProfileRepository;
            _context = dataContext;
        }

        public async Task<HealthProfile> GetHealthProfileByStudentID(string studentId)
        {
            return await _context.HealthProfile
                .FirstOrDefaultAsync(h => h.StudentID == studentId);
        }

    }
}
