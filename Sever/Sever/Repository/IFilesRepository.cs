using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using Sever.Context;
using Sever.Model;
using System;
using System.ComponentModel;
using static System.Net.Mime.MediaTypeNames;

namespace Sever.Repository
{
    public interface IFilesRepository
    {
        Task<Files> AddAsync(Files image);
        Task<List<Files>> GetLogoBySchoolIdAsync(string id);
        Task<List<Files>> GetImageByMedicineIdAsync(string id);
        Task<List<Files>> GetImageByMedicalEventIdAsync(string id);
        Task<List<Files>> GetImageByNewsIdAsync(string id);
        Task<bool> DeleteAsync(string imageLink);
        Task SaveChangesAsync();


    }
    public class FilesRepository : IFilesRepository
    {
        private readonly DataContext _context;
        public FilesRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<Files> AddAsync(Files file)
        {
            await _context.Files.AddAsync(file);
            return file;
        }
        
        public async Task<bool> DeleteAsync(string imageLink)
        {
            var file = _context.Files.FirstOrDefault(f => f.FileLink == imageLink);
            file.IsActive = false;
            _context.Files.Update(file);
            var result = await _context.SaveChangesAsync();
            return result > 0;

        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

       public async Task<List<Files>> GetLogoBySchoolIdAsync(string id)
        {
            return await _context.Files.Where(f => f.SchoolID == id && f.IsActive == true).ToListAsync();
        }

        public async Task<List<Files>> GetImageByNewsIdAsync(string id)
        {
            return await _context.Files.Where(n => n.NewsID == id && n.IsActive == true).ToListAsync();
        }

        public async Task<List<Files>> GetImageByMedicalEventIdAsync(string id)
        {
            return await _context.Files.Where(m => m.MedicalEventID == id && m.IsActive == true).ToListAsync();
        }

        public async Task<List<Files>> GetImageByMedicineIdAsync(string id)
        {
            return await _context.Files
                .Where(m => m.MedicineID == id && m.IsActive == true)
                .ToListAsync();
        }



    }
}
