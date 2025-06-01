using Sever.Context;
using Sever.Model;
using System;
using static System.Net.Mime.MediaTypeNames;

namespace Sever.Repository
{
    public interface IFilesRepository
    {
        Task<Files> AddAsync(Files image);
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

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
