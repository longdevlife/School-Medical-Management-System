using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
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
        public AdminController(IUserService userService,
                               IFilesService filesService)
        {
            _userService = userService;
            _filesService = filesService;
        }
        [HttpGet("get-admin")]
        public async Task<IActionResult> GetAdmin()
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
        public async Task<IActionResult> UpdateAccount(UpdateUserRequest userRequest)
        {
            string username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "Không tìm thấy thông tin người dùng" });
            }
            try
            {
                var result = await _userService.UpdateUserAsync(userRequest, username);
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
        public async Task<IActionResult> DeleteAccount(string username)
        {
            if (string.IsNullOrEmpty(username))
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
            {
                return BadRequest(new { message = "Vui lòng gửi tệp." });
            }
            try
            {
                var stream = file.OpenReadStream();
                var users =  _filesService.GetUsersFromExcel(stream);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lấy người dùng từ tệp thất bại", error = ex.Message });
            }
        }
    }
}
