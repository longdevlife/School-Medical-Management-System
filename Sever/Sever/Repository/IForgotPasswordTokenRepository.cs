using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;

namespace Sever.Repository
{
    public interface IForgotPasswordTokenRepository
    {
        Task CreateTokenAsync(ForgotPasswordToken token);
        Task<ForgotPasswordToken?> GetByTokenAsync(string token);
        Task DeleteAsync(ForgotPasswordToken token);
        Task SaveChangesAsync();
    }

    public class ForgotPasswordTokenRepository : IForgotPasswordTokenRepository
    {
        private readonly DataContext _context;
        public ForgotPasswordTokenRepository(DataContext context)
        {
            _context = context;
        }
        public async Task CreateTokenAsync(ForgotPasswordToken token)
        {
            await _context.ForgotPasswordToken.AddAsync(token);
        }

        public async Task<ForgotPasswordToken?> GetByTokenAsync(string token)
        {
            return await _context.Set<ForgotPasswordToken>()
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token);
        }

        public async Task DeleteAsync(ForgotPasswordToken token)
        {
             _context.ForgotPasswordToken.Remove(token);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

    }
}
