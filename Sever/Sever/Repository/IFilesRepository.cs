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
        Task<List<HealthCheckUp>> ReadHealthCheckUpExcelFile(string filePath);
        Task<List<VaccinationRecord>> ReadVaccineExcelFile(string filePath);
        Task SaveChangesAsync();
    }
    public class FilesRepository : IFilesRepository
    {
        private readonly DataContext _context;
        public FilesRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<Files> AddAsync(Files image)
        {
            await _context.Files.AddAsync(image);
            return image;
        }

        [Obsolete]
        public async Task<List<HealthCheckUp>> ReadHealthCheckUpExcelFile(string filePath)
        {
            OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

            var result = new List<HealthCheckUp>();

            using (var package = new ExcelPackage(new FileInfo(filePath)))
            {
                var worksheet = package.Workbook.Worksheets[0];
                int rowCount = worksheet.Dimension.Rows;

                for (int row = 2; row <= rowCount; row++)
                {
                    var healthCheckUp = new HealthCheckUp
                    {
                        
                    };


                    result.Add(healthCheckUp);
                }
            }

            return await Task.FromResult(result);
        }

        [Obsolete]
        public async Task<List<VaccinationRecord>> ReadVaccineExcelFile(string filePath)
        {
            OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

            var result = new List<VaccinationRecord>();

            using (var package = new ExcelPackage(new FileInfo(filePath)))
            {
                var worksheet = package.Workbook.Worksheets[0];
                int rowCount = worksheet.Dimension.Rows;

                for (int row = 2; row <= rowCount; row++)
                {
                    var vaccinationRecord = new VaccinationRecord
                    {

                    };
                    result.Add(vaccinationRecord);
                }
            }

            return await Task.FromResult(result);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
