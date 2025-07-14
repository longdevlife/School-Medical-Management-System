using CloudinaryDotNet.Actions;
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
        Task<User> GetUserByIdAsyc(string id);

    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IStudentProfileRepository _studentProfileRepository;
        private readonly IEmailService _emailService;
        public UserService(IUserRepository userRepository, IStudentProfileRepository studentProfileRepository, IEmailService emailService)
        {
            _userRepository = userRepository;
            _studentProfileRepository = studentProfileRepository;
            _emailService = emailService;
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
                Email = userRequest.Email,
            };
            user.RoleID = userRequest.RoleName switch
            {
                "Parent" => "1",
                "Nurse" => "2",
                "Manager" => "3",
                _ => throw new ArgumentException("Vai trò không hợp lệ", nameof(userRequest.RoleName))
            };
            user.PasswordHash = passwordHasher.HashPassword(user, user.PasswordHash);
            string roleDisplayName = userRequest.RoleName switch
            {
                "Parent" => "Phụ huynh",
                "Nurse" => "Y tá",
                "Manager" => "Quản lý",
                _ => throw new ArgumentException("Vai trò không hợp lệ", nameof(userRequest.RoleName))
            };
            string message = $@"
                            <p>Kính gửi Quý phụ huynh/nhân viên,</p>

                            <p>Tài khoản của quý vị đã được khởi tạo trên hệ thống quản lý y tế học đường. Dưới đây là thông tin đăng nhập:</p>

                            <ul>
                                <li><b>Tên đăng nhập (Username):</b> {userRequest.UserName}</li>
                                <li><b>Mật khẩu (Password):</b> {userRequest.Password}</li>
                                <li><b>Vai trò:</b> {roleDisplayName}</li>
                            </ul>

                            <p>Quý vị có thể đăng nhập vào hệ thống tại địa chỉ: <b><a href='http://localhost:5173/login' target='_blank'>http://localhost:5173/login</a></b></p>

                            <p>Vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên để đảm bảo an toàn thông tin cá nhân.</p>

                            <p>Nếu có bất kỳ thắc mắc nào, xin liên hệ với bộ phận quản trị hệ thống.</p>

                            <br>
                            <p>Trân trọng,</p>
                            <p><b>Ban Quản Trị Hệ Thống</b></p>
                            ";

            await _emailService.SendEmailAsync(user.Email, "Thông báo tài khoản đăng nhập hệ thống", message);

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
                    RoleName = user.Role.RoleName,
                    Email = user.Email,
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
                    RoleName = user.Role.RoleName,
                    Email = user.Email,
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

        public async Task<User> GetUserByIdAsyc(string id)
        {
            var user = await _userRepository.GetUserByIdAsyc(id);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            return user;
        }
    }
}
