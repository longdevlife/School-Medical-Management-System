using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.Authentication;
using Sever.Service;

namespace Sever.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var tokenResponse = await _authService.LoginAsync(request);

            if (tokenResponse == null)
                return Unauthorized(new { message = "Invalid username or password" });

            return Ok(tokenResponse);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] TokenResponse tokenRequest)
        {
            var tokenResponse = await _authService.RefreshTokenAsync(tokenRequest.AccessToken, tokenRequest.RefreshToken);

            if (tokenResponse == null)
                return Unauthorized();
            return Ok(tokenResponse);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] string refreshToken)
        {
            var success = await _authService.LogoutAsync(refreshToken);
            if (!success) return NotFound(new { message = "Refresh token not found" });
            return Ok(new { message = "Logged out successfully" });
        }
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto google)
        {
            var jwt = await _authService.AuthenticateWithGoogleAsync(google.IdToken);
            return Ok(new
            {
                token = jwt
            });
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}/reset-password";
            var result = await _authService.SendForgotPasswordEmailAsync(request.UsernameOrEmail, baseUrl);
            if (result == null)
            {
                return NotFound(new { message = "Người dùng hoặc email không tồn tại hoặc chưa được đăng kí" });
            }
            return Ok(new
            {
                message = "Email đã được gửi",
                result = result.ToString()
            });

        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var result = await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
            if (!result) return BadRequest(new { message = "Token không hợp lệ hoặc đã hết hạn" });
            return Ok(new { message = "Đổi mật khẩu thành công" });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest changePasswordRequest)
        {
            string username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return NotFound("Không tìm thấy người dùng để đổi mật khẩu");
            }
            try
            {
                var result = await _authService.ChangePassworAsync(username, changePasswordRequest.oldPass, changePasswordRequest.newPass);
                if (result)
                {
                    return Ok(new { message = "Thay đổi mật khẩu thành công" });
                }
                else
                {
                    return BadRequest("Thay đổi mật khẩu thất bại");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi khi thay đổi mật khẩu" + ex.Message);
            }
        }
    }
}
