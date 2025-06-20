using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.User;
using Sever.Service;

namespace Sever.Controllers
{
    [Authorize]
    [Route("api/user")]
    [ApiController]
    public class UserController : Controller
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpGet("get-user-info")]
        public async Task<IActionResult> GetManagerInfo()
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
                    message = "Lấy thông tin manager thành công"
                });
            }
            catch
            {
                return BadRequest(new { message = "Không tìm thấy thông tin người dùng" });
            }
        }

        [HttpPut("update-user-info")]
        public async Task<IActionResult> UpdatemanagerAccount(UpdateUserRequest userRequest)
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
    }
}
