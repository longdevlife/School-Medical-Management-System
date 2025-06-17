using Microsoft.AspNetCore.Identity;
using OfficeOpenXml.ConditionalFormatting.Contracts;
using Sever.DTO.User;
using Sever.Migrations;
using Sever.Model;
using Sever.Repository;
using System.Threading.Tasks;

namespace Sever.Service
{
    public interface IUserService
    {
        Task<User> GetUserAsyc(string username);
        Task<User> CreateUserAsyc(CreateUserRequest userRequest);
        Task<bool> UpdateUserAsync(UpdateUserRequest userRequest, string userName);
        Task<bool> DeleteUserByUserNameAsync(DeleteUserRequest username);
    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        public async Task<User> GetUserAsyc(string username)
        {
            var user = await _userRepository.GetUserByUsernameAsync(username);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            return user;
        }
        public async Task<User> CreateUserAsyc(CreateUserRequest userRequest)
        {
            var passwordHasher = new PasswordHasher<User>();
            var user = new User
            {
                UserName = userRequest.UserName,
                UserID = userRequest.UserID,
                PasswordHash = userRequest.Password,
                RoleID = userRequest.RoleID
            };
            user.PasswordHash = passwordHasher.HashPassword(user, user.PasswordHash);
            return await _userRepository.CreateAsync(user);
        }

        public async Task<bool> UpdateUserAsync(UpdateUserRequest userRequest, string userName)
        {
            var user = await _userRepository.GetUserByUsernameAsync(userName);
            if (user == null)
                return false;
            var passwordHasher = new PasswordHasher<User>();
            if(!string.IsNullOrEmpty(userRequest.Password))
            {
                user.PasswordHash = passwordHasher.HashPassword(user, userRequest.Password);
            }
            if (!string.IsNullOrEmpty(userRequest.Name))
            {
                user.Name = userRequest.Name;
            }
            if (!string.IsNullOrEmpty(userRequest.Email))
            {
                user.Email = userRequest.Email;
            }
            if (!string.IsNullOrEmpty(userRequest.Phone))
            {
                user.Phone = userRequest.Phone;
            }
            var result = await _userRepository.UpdateUserAsync(user);
            return result;
        }

        public async Task<bool> DeleteUserByUserNameAsync(DeleteUserRequest userDelete)
        {
            var user = await _userRepository.GetUserByUsernameAsync(userDelete.UserName);
            if (user == null)
            {
                return false;
            }
            var result = await _userRepository.DeleteAccountByUserAsync(user);
            return result;
        }

    }
}
