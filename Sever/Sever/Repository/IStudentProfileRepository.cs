using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;

namespace Sever.Repository
{
    public interface IStudentProfileRepository
    {
        Task<StudentProfile> SearchStudentProfile(string info);
    }
    public class StudentProfileRepository : IStudentProfileRepository
    {
        private readonly DataContext _context;
        public StudentProfileRepository(DataContext context)
        {
            _context = context;
        }
        public async Task<StudentProfile> SearchStudentProfile(string info)
        {
            var result = await _context.StudentProfile
                    .Include(s => s.Parent)
                    .FirstOrDefaultAsync(s => s.Parent.Name.Contains(info) || s.Parent.Phone.Contains(info) || s.StudentID.Contains(info) || s.StudentName.Contains(info));
            if (result == null)
            {
                throw new KeyNotFoundException("không tìm thấy học sinh dựa trên thông tin đã dung ");
            }
            else
            {
                return result;
            }
        }
    }

}
