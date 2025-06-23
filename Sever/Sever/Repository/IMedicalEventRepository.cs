using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.DTO.MedicalEvent;
using Sever.Model;
using Sever.Utilities;
using System.Threading.Tasks;

namespace Sever.Repository.Interfaces
{
    public interface IMedicalEventRepository
    {
        Task<MedicalEvent> CreateMedicalEvent(MedicalEvent medicalEvent);
        Task CreateMedicalEventDetails(IEnumerable<MedicalEventDetail> details);
        Task<MedicalEvent> GetMedicalEventById(string medicalEventId);
        Task<List<MedicalEvent>> GetMedicalEventsByParentIdAsync(string studentId);
        Task UpdateMedicalEvent(MedicalEvent medicalEvent);
        Task<string> GetCurrentMedicialEventID();
        Task<bool> IsStudentBelongToParentAsync(string studentId, string parentId);
        Task<List<MedicalEvent>> GetMedicineByStudentIdAsync(string studentId);

        public class MedicalEventRepository : IMedicalEventRepository
        {
            private readonly DataContext _context;

            public MedicalEventRepository(DataContext context)
            {
                _context = context;
            }

            public async Task<MedicalEvent> CreateMedicalEvent(MedicalEvent medicalEvent)
            {
                _context.MedicalEvent.Add(medicalEvent);
                await _context.SaveChangesAsync();
                return medicalEvent;
            }

            public async Task CreateMedicalEventDetails(IEnumerable<MedicalEventDetail> details)
            {
                _context.MedicalEventDetail.AddRange(details);
                await _context.SaveChangesAsync();
            }

            public async Task<MedicalEvent> GetMedicalEventById(string medicalEventId)
            {
                return await _context.MedicalEvent
                    .Include(m => m.MedicalEventDetail)
                    .Include(m => m.File)
                    .FirstOrDefaultAsync(m => m.MedicalEventID == medicalEventId);

            }
            public async Task<List<MedicalEvent>> GetMedicalEventsByParentIdAsync(string studentId)
            {
                var studentIds = await _context.StudentProfile
                    .Select(sp => sp.StudentID)
                    .ToListAsync();

                if (!studentIds.Any()) return new List<MedicalEvent>();

                var medicalEvents = await _context.MedicalEvent
                    .Include(e => e.MedicalEventDetail)
                    .Include(e => e.File)
                    .Where(e => e.MedicalEventDetail.Any(d => studentIds.Contains(d.StudentID)))
                    .ToListAsync();

                return medicalEvents;
            }
            public async Task UpdateMedicalEvent(MedicalEvent medicalEvent)
            {
                _context.MedicalEvent.Update(medicalEvent);
                await _context.SaveChangesAsync();
            }

            public async Task<string> GetCurrentMedicialEventID()
            {
                var crurrentMedicine = await _context.MedicalEvent.OrderByDescending(n => n.MedicalEventID).FirstOrDefaultAsync();
                if (crurrentMedicine == null)
                {
                    return "ME0001";
                }
                string result = GenerateID.GenerateNextId(crurrentMedicine.MedicalEventID, "ME", 4);
                return result;

            }

            public async Task<bool> IsStudentBelongToParentAsync(string studentId, string parentId)
            {
                return await _context.StudentProfile
                    .AnyAsync(s => s.StudentID == studentId && s.ParentID == parentId);
            }
            public async Task<List<MedicalEvent>> GetMedicineByStudentIdAsync(string studentId)
            {
                return await _context.MedicalEvent
                    .Include(m => m.MedicalEventDetail)
                    .Where(m => m.MedicalEventDetail.Any(d => d.StudentID == studentId))
                    .ToListAsync();
            }
        }
    }
}

