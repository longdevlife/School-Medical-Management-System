using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.DTO.MedicalEvent;
using Sever.Model;

namespace Sever.Repository.Interfaces
{
    public interface IMedicalEventRepository
    {
        Task<MedicalEvent> CreateMedicalEvent(MedicalEvent medicalEvent);
        Task CreateMedicalEventDetails(IEnumerable<MedicalEventDetail> details);
        Task<MedicalEvent> GetMedicalEventById(string medicalEventId);
        Task UpdateMedicalEvent(MedicalEvent medicalEvent);
        Task AddMedicalEventImage(string medicalEventId, string fileId);
        Task<MedicalEvent> GetLatestMedicalEventAsync();
    }

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
                .Include(m => m.Files) // Lấy cả file đính kèm (nếu có)
                .FirstOrDefaultAsync(m => m.MedicalEventID == medicalEventId);
        }

        public async Task UpdateMedicalEvent(MedicalEvent medicalEvent)
        {
            _context.MedicalEvent.Update(medicalEvent);
            await _context.SaveChangesAsync();
        }
        public async Task AddMedicalEventImage(string medicalEventId, string fileId)
        {
            var file = await _context.Files.FindAsync(fileId);
            if (file == null)
                throw new Exception("Image file not found");

            file.MedicalEventID = medicalEventId; // Gán quan hệ ngược

            await _context.SaveChangesAsync();
        }

        public async Task<MedicalEvent> GetLatestMedicalEventAsync()
        {
            return await _context.MedicalEvent
                .OrderByDescending(m => m.MedicalEventID)
                .FirstOrDefaultAsync();
        }
    }
}

