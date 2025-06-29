using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.News;
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
        private readonly INewsService _newsService;
        public ManagerController(IStudentService studentService, IUserService userService, INewsService newsService)
        {
            _studentService = studentService;
            _userService = userService;
            _newsService = newsService;
        }

        [HttpGet("search-student-profile/{info}")]
        public async Task<IActionResult> SearchStudentProfile(string info)
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
        [HttpGet("get-news-by-manager")]
        public async Task<IActionResult> GetNewsByManager()
        {
            string username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "Không tìm thấy thông tin người dùng" });
            }
            var user = await _userService.GetUserAsyc(username);
            try
            {
                var news = await _newsService.GetNewsByUserIdAsync(user.UserID);
                if (news == null)
                {
                    return NotFound(new { message = "Không có tin tức nào để hiển thị" });
                }
                return Ok(news);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi lấy tin tức: {ex.Message}" });
            }
        }

        [HttpPost("create-news")]
        public async Task<IActionResult> CreateNews(CreateNews newNews)
        {
            string username = User.Identity?.Name;
            if (newNews == null)
            {
                return BadRequest(new { message = "Thông tin tin tức không được để trống" });
            }
            try
            {
                var user = await _userService.GetUserAsyc(username);
                var news = await _newsService.CreateNewsAsync(newNews, user.UserID);
                return CreatedAtAction(nameof(GetNewsByManager), new { id = news.NewsID }, news);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi tạo tin tức: {ex.Message}" });
            }
        }

        [HttpPut("update-news")]
        public async Task<IActionResult> UpdateNews([FromForm]UpdateNews updateNews)
        {
            if (updateNews == null || string.IsNullOrEmpty(updateNews.NewsID))
            {
                return BadRequest(new { message = "Thông tin tin tức không hợp lệ" });
            }
            try
            {
                var result = await _newsService.UpdateNewsAsync(updateNews);
                if (result)
                {
                    return Ok(new { message = "Cập nhật tin tức thành công" });
                }
                else
                {
                    return NotFound(new { message = "Không tìm thấy tin tức để cập nhật" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi cập nhật tin tức: {ex.Message}" });
            }
        }

        [HttpDelete("delete-news/{id}")]
        public async Task<IActionResult> DeleteNews(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { message = "ID tin tức không được để trống" });
            }
            try
            {
                var result = await _newsService.DeleteNewsByIdAsync(id);
                if (result)
                {
                    return Ok(new { message = "Xóa tin tức thành công" });
                }
                else
                {
                    return NotFound(new { message = "Không tìm thấy tin tức để xóa" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi xóa tin tức: {ex.Message}" });
            }
        }
    }
}
