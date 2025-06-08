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
        Task<bool> DeleteUserByUserNameAsync(string username);
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
            var user = new User
            {
                UserName = userRequest.UserName,
                UserID = userRequest.UserID,
                PasswordHash = userRequest.Password.GetHashCode().ToString(),
                RoleID = userRequest.RoleID
            };
            return await _userRepository.CreateAsync(user);
        }

        public async Task<bool> UpdateUserAsync(UpdateUserRequest userRequest, string userName)
        {
            var user = await _userRepository.GetUserByUsernameAsync(userName);
            if (user == null)
                return false;

            user.Name = userRequest.Name;
            user.Email = userRequest.Email;
            user.Phone = userRequest.Phone;
            var result = await _userRepository.UpdateUserAsync(user);
            return result;
        }

        public async Task<bool> DeleteUserByUserNameAsync(string username)
        {
            var user = await _userRepository.GetUserByUsernameAsync(username);
            if (user == null)
            {
                return false;
            }
            var result = await _userRepository.DeleteAccountByUserAsync(user);
            return result;
        }
    }
}
