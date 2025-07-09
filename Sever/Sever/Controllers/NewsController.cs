using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sever.Service;

namespace Sever.Controllers
{
    [Route("api/news")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly INewsService _newsService;
        public NewsController(INewsService newsService)
        {
            _newsService = newsService;
        }
        [HttpGet("get-all-news")]
        public async Task<IActionResult> GetAllNews()
        {
            try
            {
                var news = await _newsService.GetAllNewsForHomePage();
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
