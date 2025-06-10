using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sever.Model;
using Sever.Service;

namespace Sever.Controllers
{
    [Route("api/[controller]")]
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
    }
}
