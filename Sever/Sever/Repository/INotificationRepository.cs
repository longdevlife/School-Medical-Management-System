using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;
using Sever.Utilities;

namespace Sever.Repository.Interfaces
{
    public interface INotificationRepository
    {
        Task AddNotificationAsync(Notify notification);
        //Task<List<string>> GetParentIDMedicalEventAsync(string medicalEventID);
        //Task<List<string>> GetParentIDMedicineAsync(string medicineID);
        Task<bool> CheckParentExistsAsync(string parentID);
        Task<bool> CheckNurseExistsAsync(string nurseID);
        Task<string> GetCurrentNotifyID();
    }
    public class NotificationRepository : INotificationRepository
    {
        private readonly DataContext _context;

        public NotificationRepository(DataContext context)
        {
            _context = context;
        }

        public async Task AddNotificationAsync(Notify notification)
        {
            await _context.Notify.AddAsync(notification);
            await _context.SaveChangesAsync();
        }

        public async Task<string> GetCurrentNotifyID()
        {
            var crurrentNews = await _context.Notify.OrderByDescending(n => n.NotifyID).FirstOrDefaultAsync();
            if (crurrentNews == null)
            {
                return "No0001";
            }
            string result = GenerateID.GenerateNextId(crurrentNews.NotifyID, "No", 4);
            return result;
        }

        //public async Task<List<string>> GetParentIDMedicineAsync(string medicinetID)
        //{
        //    var studentIds = await _context.MedicineHistory
        //        .Where(d => d.MedicineID == medicinetID)
        //        .Select(d => d.StudentID)
        //        .ToListAsync();

        //    if (!studentIds.Any()) return new List<string>();

        //    var parentIds = await _context.Users
        //        .Where(u => u.RoleID == "1" && u.StudentProfile.Any(sp => studentIds.Contains(sp.StudentID)))
        //        .Select(u => u.UserID)
        //        .ToListAsync();

        //    return parentIds;
        //}

        //public async Task<List<string>> GetParentIDMedicalEventAsync(string medicalEventID)
        //{
        //    var studentIds = await _context.MedicalEventDetail
        //        .Where(d => d.MedicalEventID == medicalEventID)
        //        .Select(d => d.StudentID)
        //        .ToListAsync();

        //    if (!studentIds.Any()) return new List<string>();

        //    var parentIds = await _context.Users
        //        .Where(u => u.RoleID == "1" && u.StudentProfile.Any(sp => studentIds.Contains(sp.StudentID)))
        //        .Select(u => u.UserID)
        //        .ToListAsync();

        //    return parentIds;
        //}
        public async Task<bool> CheckParentExistsAsync(string parentID)
        {
            return await _context.Users.AnyAsync(u => u.UserID == parentID && u.RoleID == "1");
        }
        public async Task<bool> CheckNurseExistsAsync(string nurseID)
        {
            return await _context.Users.AnyAsync(u => u.UserID == nurseID && u.RoleID == "2");
        }

    }
}
