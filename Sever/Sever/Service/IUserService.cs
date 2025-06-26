using Microsoft.AspNetCore.Identity;
using OfficeOpenXml.ConditionalFormatting.Contracts;
using Sever.DTO.User;
//using Sever.Migrations;
using Sever.Model;
using Sever.Repository;
using Sever.Utilities;
using System.Threading.Tasks;

namespace Sever.Service
{
    public interface IUserService
    {
        Task<User> GetUserAsyc(string username);
        Task<User> CreateUserAsyc(CreateUserRequest userRequest);
        Task<bool> UpdateUserAsync(UpdateUserRequest userRequest, string userName);
        Task<bool> DeleteUserByUserNameAsync(DeleteUserRequest username);
        Task<List<GetUser>> GetAllUserAsync();
        Task<List<GetUser>?> SearchUserAsync(string key);
        Task<bool> ActivativeAccountasync(string userName);
    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IStudentProfileRepository _studentProfileRepository;
        public UserService(IUserRepository userRepository, IStudentProfileRepository studentProfileRepository)
        {
            _userRepository = userRepository;
            _studentProfileRepository = studentProfileRepository;
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
                UserID = await _userRepository.NextId(),
                UserName = userRequest.UserName,
                PasswordHash = userRequest.Password,

            };
            user.RoleID = userRequest.RoleName switch
            {
                "Parent" => "1",
                "Nurse" => "2",
                "Manager" => "3",
                _ => throw new ArgumentException("Vai trò không hợp lệ", nameof(userRequest.RoleName))
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
            if (!string.IsNullOrEmpty(userRequest.Password))
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
        public async Task<List<GetUser>> GetAllUserAsync()
        {
            var users = await _userRepository.GetAllUser();
            List<GetUser> userDtos = new List<GetUser>();
            if (users == null || users.Count == 0)
            {
                throw new Exception("No users found");
            }
            foreach (var user in users)
            {
                var userDto = new GetUser
                {
                    UserID = user.UserID,
                    UserName = user.UserName,
                    IsActive = user.IsActive,
                    RoleName = user.Role.RoleName
                };
                userDtos.Add(userDto);
            }
            return userDtos;
        }
        public async Task<List<GetUser>?> SearchUserAsync(string key)
        {
            var users = await _userRepository.SearchUser(key);
            if (users == null || users.Count == 0)
            {
                throw new Exception("No users found with the provided key");
            }

            var userDtos = new List<GetUser>();
            foreach (var user in users)
            {
                var userDto = new GetUser
                {
                    UserID = user.UserID,
                    UserName = user.UserName,
                    IsActive = user.IsActive,
                    RoleName = user.Role.RoleName
                };
                userDtos.Add(userDto);
            }
            return userDtos;
        }

        public async Task<bool> ActivativeAccountasync(string userName)
        {
            if (userName == null)
            {
                throw new Exception("UserName không được bỏ trống");
            }
            var result = await _userRepository.ActivativeUserAsync(userName);
            return result;
        }
    }
}
