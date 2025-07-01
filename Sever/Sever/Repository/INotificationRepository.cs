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
        Task<bool> CheckParentExistsAsync(string parentID);
        //Task<bool> CheckNurseExistsAsync(string nurseID);
        Task<string> GetCurrentNotifyID();
        Task<string> GetParentIdByStudentIdAsync(string studentId);
        Task<List<string>> GetAllNurseIDsAsync();

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
                var lastNotify = await _context.Notify
                    .OrderByDescending(n => n.NotifyID)
                    .FirstOrDefaultAsync();

            string newId;
            if (lastNotify == null)
            {
                newId = "No0001";
            }
            else
            {
                newId = GenerateID.GenerateNextId(lastNotify.NotifyID, "NT", 4);
            }
            while (await _context.Notify.AnyAsync(n => n.NotifyID == newId))
            {
                newId = GenerateID.GenerateNextId(newId, "NT", 4);
            }

            return newId;
        }


            public async Task<string> GetParentIdByStudentIdAsync(string studentId)
            {
                if (string.IsNullOrEmpty(studentId))
                {
                    return null;
                }

                var parentId = await _context.Users
                    .Where(u => u.RoleID == "1" && u.StudentProfile.Any(sp => sp.StudentID == studentId))
                    .Select(u => u.UserID)
                    .FirstOrDefaultAsync();

                return parentId;
            }
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
            public async Task<List<string>> GetAllNurseIDsAsync()
            {
                return await _context.Users
                    .Where(u => u.RoleID == "2" && u.IsActive == true)
                    .Select(u => u.UserID)
                    .ToListAsync();
            }

        
    }
}
