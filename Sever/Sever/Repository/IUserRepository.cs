using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;
using System;

namespace Sever.Repository
{
    public interface IUserRepository
    {
        Task<User?> GetUserByUsernameAsync(string username);
    }

    public class UserRepository : IUserRepository
    {
        private readonly DataContext _context;
        public UserRepository(DataContext context) => _context = context;

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
        }
    }
}
