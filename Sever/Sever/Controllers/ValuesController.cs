using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Sever.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        // API này chỉ được truy cập khi có token hợp lệ
        [HttpGet("check-token")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public IActionResult CheckToken()
        {
            // Nếu token hợp lệ, middleware đã cho phép truy cập vào đây
            // Bạn có thể lấy thông tin user từ User.Claims nếu cần
            return Ok(new { message = "Token is valid and active." });
        }
    }
}
