using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.User;
using Sever.Service;

namespace Sever.Controllers
{
    [Authorize(Roles = "3")]
    [Route("api/manager")]
    [ApiController]
    public class ManagerController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IStudentService _studentService;
        public ManagerController(IStudentService studentService, IUserService userService) { 
            _studentService = studentService;
            _userService = userService;
        }

        [HttpGet("get-manager-info")]
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

        [HttpPut("update-manager-info")]
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

        [HttpGet("search-student-profile")]
        public async Task<IActionResult> SearchStudentProfile([FromBody]string info)
        {
            if (string.IsNullOrEmpty(info))
            {
                return BadRequest(new { message = "Thông tin học sinh không được để trống" });
            }
            try
            {
                var studentProfile = await _studentService.SearchStudentProfileAsync(info);
                if (studentProfile == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin học sinh" });
                }
                return Ok(studentProfile);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi tìm kiếm thông tin học sinh: {ex.Message}" });
            }
        }
    }
}
