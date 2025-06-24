using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sever.Service;

namespace Sever.Controllers
{
    [Authorize]
    [Route("api/school")]
    [ApiController]
    public class SchoolController : ControllerBase
    {
        private readonly ISchoolInfoService _schoolInfoService;
        private readonly IFilesService _filesService;
        public SchoolController(ISchoolInfoService schoolInfoService, IFilesService filesService)
        {
            _schoolInfoService = schoolInfoService;
            _filesService = filesService;
        }
        [HttpGet("get-school-info")]
        public async Task<IActionResult> GetSchoolInfo()
        {
            var schoolInfo = await _schoolInfoService.GetSchoolInfoAsync();
            if (schoolInfo == null)
            {
                return NotFound(new { message = "Không tìm thấy thông tin trường học" });
            }
            return Ok(schoolInfo);
        }

    }
}
