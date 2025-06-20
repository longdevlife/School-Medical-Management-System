using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;
using Sever.Utilities;

namespace Sever.Repository
{
    public interface IMedicineRepository
    {
        Task<Medicine> CreateMedicineAsync(Medicine medicine);
        Task UpdateMedicineAsync(Medicine medicine);
        Task<string> GetCurrentMedicineID();
        Task<Medicine> GetMedicineByIdAsync(string medicineId);
        Task<List<Medicine>> GetMedicineByParentIdAsync(string studentId);
        //Task<List<Medicine>> GetMedicineByNurseIdAsync(string nurseId);

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

        public async Task UpdateMedicineAsync(Medicine medicine)
        {
            _context.Medicine.Update(medicine);
            await _context.SaveChangesAsync();
        }

        public async Task<Medicine> GetMedicineByIdAsync(string medicineId)
        {

            var result = await _context.Medicine.FirstOrDefaultAsync(n => n.MedicineID == medicineId);
            if (result == null)
                return null;
            return result;
        }

        //public async Task<List<Medicine>> GetMedicineByNurseIdAsync(string nurseId)
        //{
        //    return await _context.Medicine
        //        .Where(n => n.NurseID == nurseId)
        //        .ToListAsync();
        //}

        public async Task<List<Medicine>> GetMedicineByParentIdAsync(string studentId)
        {
            return await _context.Medicine
                .Where(n =>  n.StudentID == studentId )
                .ToListAsync();
        }

        public async Task<string> GetCurrentMedicineID()
        {
            var lastMedicine = await _context.Medicine
                .OrderByDescending(m => m.MedicineID)
                .FirstOrDefaultAsync();

            string newId;
            if (lastMedicine == null)
            {
                newId = "M0001";
            }
            else
            {
                newId = GenerateID.GenerateNextId(lastMedicine.MedicineID, "M", 4);
            }

            while (await _context.Medicine.AnyAsync(m => m.MedicineID == newId))
            {
                newId = GenerateID.GenerateNextId(newId, "M", 4);
            }

            return newId;
        }

    }
}
