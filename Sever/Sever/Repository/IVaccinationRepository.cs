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
        Task<VaccinationRecord> GetVaccineByIdAsync(string id);



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
            var vaccinations = await GetVaccineByIdAsync(id);
            if (vaccinations == null) return false;
            _context.VaccinationRecord.Remove(vaccinations);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<VaccinationRecord> GetVaccineByIdAsync(string id)
        {
            return await _context.VaccinationRecord.FirstOrDefaultAsync(h => h.VaccinatorID == id);
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

    }
}
