using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.DTO.SchoolInfo;
using Sever.Model;

namespace Sever.Repository
{
    public interface ISchoolInfoRepository
    {
        Task<SchoolInfo?> GetSchoolInfoAsync();
        Task<bool> UpdateSchoolInfoAsync(SchoolInfo schoolInfo);
    }

    public class SchoolInfoRepository : ISchoolInfoRepository
    {
        private readonly DataContext _context;
        public SchoolInfoRepository(DataContext context)
        {
            _context = context;
        }
        public async Task<SchoolInfo?> GetSchoolInfoAsync()
        {
            return await _context.SchoolInfo.FirstOrDefaultAsync();
        }
        public async Task<bool> UpdateSchoolInfoAsync(SchoolInfo schoolInfo)
        {
            _context.SchoolInfo.Update(schoolInfo);
            var result = await _context.SaveChangesAsync();
            return result > 0;

        }
    }
}
