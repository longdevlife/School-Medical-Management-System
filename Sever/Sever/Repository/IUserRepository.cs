using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;
using Sever.Utilities;
using System;

namespace Sever.Repository
{
    public interface IUserRepository
    {

        Task<User> CreateAsync(User user);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<bool> UpdateUserAsync(User user);
        Task<bool> DeleteAccountByUserAsync(User user);
        Task<User?> GetUserByEmailAsync(string email);
        Task<string> NextId();
        Task<User> GetUserByStudentIDAsync(string studentID);
    }

    public class UserRepository : IUserRepository
    {
        private readonly DataContext _context;
        public UserRepository(DataContext context) => _context = context;

        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive == true);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.UserName == username && u.IsActive == true);
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }
        public async Task<bool> DeleteAccountByUserAsync(User user)
        {
            if(user.RoleID == "4")
            {
                return false;
            }
            user.IsActive = false;
            _context.Users.Update(user);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }
        public async Task<string> NextId()
        {
            var currentUser = await _context.Users
                .OrderByDescending(u => u.UserID)
                .FirstOrDefaultAsync();
            string nextID = GenerateID.GenerateNextId(currentUser?.UserID, "U", 4);
            return nextID;
        }

        public Task<User> GetUserByStudentIDAsync(string studentID)
        {
            return _context.Users
                .Include(u => u.StudentProfile)
                .FirstOrDefaultAsync(u => u.UserID == studentID);
        }
    }
}
