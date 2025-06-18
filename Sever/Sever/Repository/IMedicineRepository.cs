using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.DTO.File;
using Sever.DTO.SendMedicine;
using Sever.Model;

namespace Sever.Repository
{
    public interface IMedicineRepository
    {
        Task<Medicine> CreateMedicineAsync(Medicine medicine);
        Task<Medicine> GetMedicineByIdAsync(string medicineId);
        Task UpdateMedicineAsync(Medicine medicine);
        Task AddHistoryAsync(MedicineHistory history);
        Task<List<MedicineHistory>> GetMedicineHistoryAsync(string medicineId);
        Task<Medicine?> GetLatestMedicineAsync();

    }

    public class MedicineRepository : IMedicineRepository
    {
        private readonly DataContext _context;

        public MedicineRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<Medicine> CreateMedicineAsync(Medicine medicine)
        {
            await _context.Medicine.AddAsync(medicine);
            await _context.SaveChangesAsync();
            return medicine;
        }

        public async Task<Medicine> GetMedicineByIdAsync(string medicineId)
        {
            return await _context.Medicine
            .Include(m => m.Files) // Lấy cả file đính kèm (nếu có)
            .FirstOrDefaultAsync(m => m.MedicineID == medicineId);
        }

        public async Task UpdateMedicineAsync(Medicine medicine)
        {
            _context.Medicine.Update(medicine);
            await _context.SaveChangesAsync();
        }


        public async Task AddHistoryAsync(MedicineHistory history)
        {
            await _context.MedicineHistory.AddAsync(history);
            await _context.SaveChangesAsync();
        }

        public async Task<List<MedicineHistory>> GetMedicineHistoryAsync(string medicineId)
        {
            return await _context.MedicineHistory
                .Where(h => h.MedicineID == medicineId)
                .OrderBy(h => h.ModifiedAt)
                .ToListAsync();
        }
        public async Task<Medicine> GetLatestMedicineAsync()
        {
            return await _context.Medicine
                .Where(m => m.MedicineID.StartsWith("M") && m.MedicineID.Length == 4)
                .OrderByDescending(m => Convert.ToInt32(m.MedicineID.Substring(1)))
                .FirstOrDefaultAsync();
        }
        
    }
}
