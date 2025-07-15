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
        private readonly INewsService _newsService;
        public SchoolController(ISchoolInfoService schoolInfoService, IFilesService filesService, INewsService newsService)
        {
            _schoolInfoService = schoolInfoService;
            _filesService = filesService;
            _newsService = newsService;
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

        [HttpGet("get-all-news")]
        public async Task<IActionResult> GetAllNews()
        {
            try
            {
                var news = await _newsService.GetAllNewsAsync();
                if (news == null || news.Count == 0)
                {
                    return NotFound(new { message = "Không có tin tức nào để hiển thị" });
                }
                return Ok(news);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi lấy tất cả tin tức: {ex.Message}" });
            }
        }
        
    }
}