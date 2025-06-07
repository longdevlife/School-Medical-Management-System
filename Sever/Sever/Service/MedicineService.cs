using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.DTO;
using Sever.Interface;
using Sever.Model;
using System;

namespace Sever.Service
{
    public class MedicineService : IMedicine
    {
        private readonly DataContext _context;
        public MedicineService(DataContext context) => _context = context;

        public async Task<string> CreateMedicineAsync(MedicineCreateDTO dto, string createdBy)
        {
            var medicine = new Medicine
            {
                MedicineID = Guid.NewGuid().ToString(),
                StudentID = dto.StudentID,
                ParentID = dto.ParentID,
                NurseID = dto.NurseID,
                Status = "Pending",
                CreatedDate = DateTime.Now,
                Notes = dto.Notes,
                UpdatedBy = createdBy,
                Doses = dto.Doses.Select(d => new MedicineDose
                {
                    DoseID = Guid.NewGuid().ToString(),
                    SpecialInstruction = d.Instruction,
                    TimeToTake = d.TimeToTake
                }).ToList(),
                Attachments = new List<Files>()
            };

            foreach (var file in dto.Attachments)
            {
                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);
                medicine.Attachments.Add(new Files
                {
                    FileID = Guid.NewGuid().ToString(),
                    FileName = file.FileName,
                    FileData = ms.ToArray(),
                    UploadDate = DateTime.Now.ToString("yyyy-MM-dd")
                });
            }

            _context.Medicine.Add(medicine);
            await _context.SaveChangesAsync();
            return medicine.MedicineID;
        }

        public async Task<bool> VerifyMedicineAsync(string medicineId, string nurseId, string notes)
        {
            var medicine = await _context.Medicine.FindAsync(medicineId);
            if (medicine == null) return false;

            medicine.Status = "Verified";
            medicine.UpdatedBy = nurseId;
            medicine.UpdatedDate = DateTime.Now;
            medicine.Notes += "\nVerified: " + notes;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectMedicineAsync(string medicineId, string nurseId, string reason)
        {
            var medicine = await _context.Medicine.FindAsync(medicineId);
            if (medicine == null) return false;

            medicine.Status = "Rejected";
            medicine.UpdatedBy = nurseId;
            medicine.UpdatedDate = DateTime.Now;
            medicine.Notes += "\nRejected: " + reason;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<MedicineHistoryDTO>> GetEditHistoryAsync(string medicineId)
        {
            return await _context.Medicine
                .Where(m => m.MedicineID == medicineId)
                .OrderByDescending(h => h.UpdatedDate)
                .Select(h => new MedicineHistoryDTO
                {
                    UpdatedDate = (DateTime)h.UpdatedDate,
                    UpdatedBy = h.UpdatedBy
                   // Changes = h.Changes
                }).ToListAsync();
        }
    }
}
