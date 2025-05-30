using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO;
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
    }
}
