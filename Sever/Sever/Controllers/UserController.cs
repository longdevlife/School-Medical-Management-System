using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.User;
using Sever.Service;

namespace Sever.Controllers
{
    [Authorize]
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly INotificationService _notificationService;
        public UserController(IUserService userService, INotificationService notificationService)
        {
            _userService = userService;
            _notificationService = notificationService;
        }

        [HttpGet("get-user-info")]
        public async Task<IActionResult> GetUserInfo()
        {
            string username = User.Identity?.Name;

            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "Không tìm thấy thông tin người dùng" });
            }

            try
            {
                var user = await _userService.GetUserAsyc(username);

                if(user == null)
                {
                    return BadRequest("Khong tim thay thong tin  nguoi dung");
                }
                return Ok(new
                {
                    user,
                    message = "Lấy thông tin người dùng thành công"
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
        [HttpGet("get-notify-by-user-id")]
        public async Task<IActionResult> GetNotifyByUserId()
        {
            string username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "Không tìm thấy thông tin người dùng" });
            }
            var user = await _userService.GetUserAsyc(username);

            try
            {
                var notifyList = await _notificationService.GetNotifyByUserId(user.UserID);
                if (notifyList == null || notifyList.Count == 0)
                {
                    return NotFound(new { message = "Không có thông báo nào" });
                }
                return Ok(notifyList);
            }
            catch
            {
                return BadRequest(new { message = "Lỗi khi lấy thông báo" });
            }
        }
    }
}
