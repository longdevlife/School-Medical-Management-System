using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.MedicalEvent;
using Sever.Service;
using System.Threading.Tasks;

namespace Sever.Controllers
{
    [Route("api/medicalEvent")]
    [ApiController]
    [Authorize]
    public class MedicalEventController : ControllerBase
    {
        private readonly IMedicalEventService _medicalEventService;

        public MedicalEventController(IMedicalEventService medicalEventService)
        {
            _medicalEventService = medicalEventService;
        }

        // Tạo mới sự kiện y tế
        [HttpPost]
        [Authorize(Roles = "2")] // Y tá
        public async Task<IActionResult> CreateMedicalEvent([FromBody] MedicineEventRequest request)
        {
            try
            {
                var userId = User.Identity?.Name;


                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { Message = "Không tìm thấy thông tin người dùng." });
                }

                var result = await _medicalEventService.CreateMedicalEvent(request);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                var baseException = ex.GetBaseException();
                throw new Exception("Lỗi khi tạo sự kiện y tế: " + baseException.Message, ex);
            }
        }

        // Lấy chi tiết sự kiện y tế
        [HttpGet("{medicalEventId}")]
        [Authorize(Roles = "1,2,3,4")] // Y tá, admin, giáo viên đều có thể xem
        public async Task<IActionResult> GetMedicalEvent(string medicalEventId)
        {
            var userId = User.Identity?.Name;

            var result = await _medicalEventService.GetMedicalEvent(medicalEventId);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy sự kiện y tế." });
            return Ok(result);
        }

        // 3. Cập nhật trạng thái / hành động xử lý
        [HttpPatch("{medicalEventId}")]
        [Authorize(Roles = "2")] // Y tá
        public async Task<IActionResult> UpdateMedicalEventStatus(string medicalEventId, [FromBody] MedicalEventUpdateDTO dto)
        {
            try
            {
                await _medicalEventService.UpdateMedicalEventStatus(medicalEventId, dto);
                return Ok(new { message = "Cập nhật sự kiện thành công." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 4. Upload ảnh cho sự kiện
        [HttpPost("{medicalEventId}/upload-image")]
        [Authorize(Roles = "2")] // Y tá
        public async Task<IActionResult> UploadImage(string medicalEventId, IFormFile file)
        {
            try
            {
                var result = await _medicalEventService.UploadMedicalEventImage(medicalEventId, file);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
