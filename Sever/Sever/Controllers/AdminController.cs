using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Sever.DTO.SchoolInfo;
using Sever.DTO.User;
using Sever.Service;
using System.Security.Claims;

namespace Sever.Controllers
{
    [Authorize(Roles = "4")]
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IFilesService _filesService;
        private readonly ISchoolInfoService _schoolInfoService;
        public AdminController(IUserService userService,
                               IFilesService filesService,
                               ISchoolInfoService schoolInfoService)
        {
            _userService = userService;
            _filesService = filesService;
            _schoolInfoService = schoolInfoService;
        }
        [HttpGet("get-admin-info")]
        public async Task<IActionResult> GetAdminInfo()
        {
            string username = User.Identity?.Name;

            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "Không tìm thấy thông tin người dùng" });
            }

            try
            {
                var user = await _userService.GetUserAsyc(username);

                return Ok(new
                {
                    user,
                    message = "Lấy thông tin admin thành công"
                });
            }
            catch
            {
                return BadRequest(new { message = "Không tìm thấy thông tin người dùng" });
            }
        }



        [HttpPost("create-accounts")]
        public async Task<IActionResult> CreateAccounts(List<CreateUserRequest> users)
        {
            if (users == null || users.Count == 0)
            {
                return BadRequest(new { message = "Danh sách người dùng không được để trống" });
            }

            try
            {
                var results = new List<string>();

                foreach (var user in users)
                {
                    try
                    {
                        await _userService.CreateUserAsyc(user);
                        results.Add($"Tạo tài khoản '{user.UserName}' thành công");
                    }
                    catch
                    {
                        results.Add($"Tạo tài khoản '{user.UserName}' thất bại");
                    }
                }

                return Ok(new { messages = results });
            }
            catch
            {
                return BadRequest(new { message = "Tạo tài khoản thất bại" });
            }
        }


        [HttpPut("update-admin-info")]
        public async Task<IActionResult> UpdateAdminAccount(UpdateUserRequest userRequest)
        {
            userRequest.UserName = User.Identity?.Name;
            if (string.IsNullOrEmpty(userRequest.UserName))
            {
                return BadRequest(new { message = "Không tìm thấy thông tin người dùng" });
            }
            try
            {
                var result = await _userService.UpdateUserAsync(userRequest, userRequest.UserName);
                if (result)
                {
                    return Ok(new { message = "Cập nhật tài khoản thành công" });
                }
                else
                {
                    return NotFound(new { message = "Không tìm thấy tài khoản để cập nhật" });
                }
            }
            catch
            {
                return BadRequest(new { message = "Cập nhật tài khoản thất bại" });
            }
        }
        [HttpPut("update-user-info")]
        public async Task<IActionResult> UpdateUserAccount(UpdateUserRequest userRequest)
        {
            if (string.IsNullOrEmpty(userRequest.UserName))
            {
                return BadRequest(new { message = "Không tìm thấy thông tin người dùng" });
            }
            try
            {
                var result = await _userService.UpdateUserAsync(userRequest, userRequest.UserName);
                if (result)
                {
                    return Ok(new { message = "Cập nhật tài khoản thành công" });
                }
                else
                {
                    return NotFound(new { message = "Không tìm thấy tài khoản để cập nhật" });
                }
            }
            catch
            {
                return BadRequest(new { message = "Cập nhật tài khoản thất bại" });
            }
        }
        [HttpDelete("delete-user")]
        public async Task<IActionResult> DeleteAccount(DeleteUserRequest username)
        {
            if (username == null)
            {
                return BadRequest(new { message = "Tên người dùng không được để trống" });
            }
            try
            {
                var result = await _userService.DeleteUserByUserNameAsync(username);
                if (result)
                {
                    return Ok(new { message = "Xóa tài khoản thành công" });
                }
                else
                {
                    return NotFound(new { message = "Không tìm thấy tài khoản để xóa" });
                }
            }
            catch
            {
                return BadRequest(new { message = "Xóa tài khoản thất bại" });
            }
        }
        [HttpPost("get-users-from-file")]
        public async Task<IActionResult> GetUsersFromFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không hợp lệ");

            var users = await _filesService.ReadUsersFromExcelAsync(file);

            return Ok(users);
        }

        [HttpPut("update-school-info")]
        public async Task<IActionResult> UpdateSchoolInfo(SchoolInfoUpdate schoolInfoRequest)
        {
            if (schoolInfoRequest == null)
            {
                return BadRequest(new { message = "Thông tin trường học không được để trống" });
            }
            try
            {
                var result = await _schoolInfoService.UpdateSchoolInfoAsync(schoolInfoRequest);
                if (result)
                {
                    return Ok(new { message = "Cập nhật thông tin trường học thành công" });
                }
                else
                {
                    return NotFound(new { message = "Không tìm thấy thông tin trường học để cập nhật" });
                }
            }
            catch
            {
                return BadRequest(new { message = "Cập nhật thông tin trường học thất bại" });
            }
        }
    }
}
