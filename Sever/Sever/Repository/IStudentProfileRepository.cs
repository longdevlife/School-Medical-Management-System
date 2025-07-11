using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;
using Sever.Utilities;

namespace Sever.Repository
{
    public interface IStudentProfileRepository
    {
        Task<StudentProfile> SearchStudentProfile(string info);
        Task<List<StudentProfile>> GetStudentProfileByParentId(string info);
        Task<StudentProfile> GetStudentProfileByStudentId(string info);
        Task<List<StudentProfile>> GetStudentProfilesByClassIdAsync(string classId);
        Task<List<StudentProfile>> GetAllStudent();
        Task<bool> CreateStudentProfile(StudentProfile student);
        Task<bool> DeleteStudentProfile(StudentProfile student);
        Task<bool> UpdateStudentProfile(StudentProfile student);
        Task<string> NextId();
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

        public async Task<List<StudentProfile>> GetStudentProfileByParentId(string id)
        {
            return await _context.StudentProfile
                .Include(s => s.Parent)
                .Where(s => s.Parent.UserID == id)
                .ToListAsync();
        }

        public async Task<List<StudentProfile>> GetStudentProfilesByClassIdAsync(string classId)
        {
            if (string.IsNullOrEmpty(classId))
            {
                throw new ArgumentException("Class ID cannot be null or empty.", nameof(classId));
            }
            return await _context.StudentProfile
                .Where(s => s.Class == classId)
                .Include(s => s.Parent)
                .ToListAsync();
        }

        public async Task<StudentProfile> GetStudentProfileByStudentId(string id)
        {
            return await _context.StudentProfile
                .FirstOrDefaultAsync(s => s.StudentID == id);

        }

        public async Task<bool> CreateStudentProfile(StudentProfile student)
        {
            await _context.StudentProfile.AddAsync(student);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }
        public async Task<string> NextId()
        {
            var currentUser = await _context.StudentProfile
                .OrderByDescending(s => s.StudentID)
                .FirstOrDefaultAsync();
            string nextID = GenerateID.GenerateNextId(currentUser?.StudentID, "ST", 4);
            return nextID;
        }
        public async Task<bool> DeleteStudentProfile(StudentProfile student)
        {
            _context.StudentProfile.Remove(student);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }
        public async Task<bool> UpdateStudentProfile(StudentProfile student)
        {
            _context.StudentProfile.Update(student);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<List<StudentProfile>> GetAllStudent()
        {
            return await _context.StudentProfile.Include(s => s.Parent).ToListAsync();
        }
    }
}
