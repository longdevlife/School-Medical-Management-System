using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;
using System;

namespace Sever.Repository
{

    public interface IRefreshTokenRepository
    {
        Task AddAsync(RefreshToken refreshToken);
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task DeleteAsync(RefreshToken refreshToken);
        Task SaveChangesAsync();
    }

    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly DataContext _context;
        public RefreshTokenRepository(DataContext context) => _context = context;

        public async Task AddAsync(RefreshToken refreshToken)
        {
            await _context.RefreshToken.AddAsync(refreshToken);
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _context.RefreshToken.Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == token);
        }

        public async Task DeleteAsync(RefreshToken refreshToken)
        {
            _context.RefreshToken.Remove(refreshToken);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
