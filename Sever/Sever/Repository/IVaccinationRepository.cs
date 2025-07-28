using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;
using Sever.Utilities;

namespace Sever.Repository
{
    public interface IVaccinationRepository
    {
        Task<VaccinationRecord> CreateVaccinationAsync(VaccinationRecord vaccinations);
        Task<bool> UpdateVaccinationAsync(VaccinationRecord vaccinations);
        Task<bool> DeleteVaccinationAsync(string id);
        Task<VaccinationRecord> GetVaccineByNurseIdAsync(string id);
        Task<VaccinationRecord> GetVaccineByRecordIdAsync(string id);
        Task<string> GetCurrentVaccinationRecordID();
        Task<List<VaccinationRecord>> GetAllVaccinationRecordsAsync();
        Task<Vaccine> GetVaccineByIdAsync(int vaccineId);
        Task<bool> UpdateStatus(VaccinationRecord vaccination, string status);
        Task<List<VaccinationRecord>> GetVaccineDeniedAsync();
        Task<List<VaccinationRecord>> GetVaccineConfirmdAsync();
        Task<List<VaccinationRecord>> GetVaccineByStudentIdAsync(string studentId);
        Task<List<VaccinationRecord>> GetVaccineNotResponseAsync();
        Task<int> TotalVaccine(DateTime fromDate, DateTime toDate);
        Task<int> CountConfirmVaccinesAsync(DateTime fromDate, DateTime toDate);
        Task<int> CountDeniedVaccinesAsync(DateTime fromDate, DateTime toDate);
        Task<int> CountNotResponseVaccinesAsync(DateTime fromDate, DateTime toDate);
    }
    public class VaccinationRepository : IVaccinationRepository
    {
        private readonly DataContext _context;
        public VaccinationRepository(DataContext context)
        {
            _context = context;
        }
        public async Task<VaccinationRecord> CreateVaccinationAsync(VaccinationRecord vaccinations)
        {
            await _context.VaccinationRecord.AddAsync(vaccinations);
            await _context.SaveChangesAsync();
            return vaccinations;
        }

        public async Task<bool> UpdateVaccinationAsync(VaccinationRecord vaccinations)
        {
            _context.VaccinationRecord.Update(vaccinations);
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<bool> DeleteVaccinationAsync(string id)
        {
            var vaccinations = await GetVaccineByNurseIdAsync(id);
            if (vaccinations == null) return false;
            _context.VaccinationRecord.Remove(vaccinations);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<VaccinationRecord> GetVaccineByNurseIdAsync(string id)
        {
            return await _context.VaccinationRecord.FirstOrDefaultAsync(h => h.NurseID == id);
        }
        public async Task<Vaccine> GetVaccineByIdAsync(int vaccineId)
        {
            return await _context.Vaccine.FirstOrDefaultAsync(v => v.VaccineID == vaccineId);
        }

        public async Task<VaccinationRecord> GetVaccineByRecordIdAsync(string id)
        {
            return await _context.VaccinationRecord
                        .FirstOrDefaultAsync(h => h.RecordID == id);
        }

        public async Task<string> GetCurrentVaccinationRecordID()
        {
            var lastVaccineRecord = await _context.VaccinationRecord
                .OrderByDescending(m => m.RecordID)
                .FirstOrDefaultAsync();

            string newId;
            if (lastVaccineRecord == null)
            {
                newId = "V0001";
            }
            else
            {
                newId = GenerateID.GenerateNextId(lastVaccineRecord.RecordID, "V", 4);
            }

            while (await _context.VaccinationRecord.AnyAsync(m => m.RecordID == newId))
            {
                newId = GenerateID.GenerateNextId(newId, "V", 4);
            }

            return newId;
        }

        public async Task<List<VaccinationRecord>> GetAllVaccinationRecordsAsync()
        {
            return await _context.VaccinationRecord
                .Include(r => r.StudentProfile)
                .Include(r => r.Vaccinator)
                 .Include(r => r.Vaccine)
                .ToListAsync();
        }


        public async Task<bool> UpdateStatus(VaccinationRecord vaccination, string status)
        {
            vaccination.Status = status;
            _context.VaccinationRecord.Update(vaccination);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<List<VaccinationRecord>> GetVaccineDeniedAsync()
        {
            return await _context.VaccinationRecord
                .Where(h => h.Status.Trim() == "Đã từ chối") 
                .Include(r => r.StudentProfile)
                .Include(r => r.Vaccine)
                .ToListAsync();
        }

        public async Task<List<VaccinationRecord>> GetVaccineConfirmdAsync()
        {
            return await _context.VaccinationRecord
                .Where(h => h.Status == "Đã xác nhận")
                .Include(r => r.StudentProfile)
                .Include(r => r.Vaccine)
                .ToListAsync();
        }
        public async Task<List<VaccinationRecord>> GetVaccineByStudentIdAsync(string studentId)
        {
            return await _context.VaccinationRecord
                .Where(v => v.StudentID == studentId)
                .Include(r => r.StudentProfile)
                .Include(v => v.Nurse)
                .Include(r => r.Vaccinator)
                .Include(r => r.Vaccine)
                .ToListAsync();
        }

        public async Task<List<VaccinationRecord>> GetVaccineNotResponseAsync()
        {
            return await _context.VaccinationRecord
                .Where(h => h.Status == "Chờ xác nhận")
                .Include(r => r.StudentProfile)
                .Include(r => r.Vaccine)
                .ToListAsync();

        }

        public async Task<int> TotalVaccine(DateTime fromDate, DateTime toDate)
        {
            return await _context.VaccinationRecord
                .Where(v => v.DateTime >= fromDate && v.DateTime <= toDate)
                .CountAsync();
        }

        public async Task<int> CountConfirmVaccinesAsync(DateTime fromDate, DateTime toDate)
        {
            return await _context.VaccinationRecord
                 .Where(v => v.Status.Contains("đã xác nhận") && v.DateTime >= fromDate && v.DateTime <= toDate)
                 .CountAsync();

        }
        public async Task<int> CountDeniedVaccinesAsync(DateTime fromDate, DateTime toDate)
        {
            return await _context.VaccinationRecord
                .Where(v => v.Status.Contains("đã từ chối") && v.DateTime >= fromDate && v.DateTime <= toDate)
                .CountAsync();
        }
        public async Task<int> CountNotResponseVaccinesAsync(DateTime fromDate, DateTime toDate)
        {
            return await _context.VaccinationRecord
                .Where(v => v.Status.Contains("chờ xác nhận") && v.DateTime >= fromDate && v.DateTime <= toDate)
                .CountAsync();
        }
    }
}
