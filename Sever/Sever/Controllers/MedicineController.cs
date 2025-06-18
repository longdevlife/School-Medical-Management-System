using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.File;
using Sever.DTO.SendMedicine;
using Sever.Service; // Đổi sang IMedicineService
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Sever.Controllers
{
    [Route("api/medicine")]
    [ApiController]
    [Authorize]
    public class MedicineController : ControllerBase
    {
        private readonly IMedicineService _medicineService; 

        public MedicineController(IMedicineService medicineService)
        {
            _medicineService = medicineService;
        }

        /// Tạo mới một đơn thuốc
        [HttpPost]
        [Authorize(Roles = "1,2")] // Parent, Nurse
        public async Task<IActionResult> CreateMedicine([FromBody] MedicineDTO medicineDto)
        {
            try
            {
                var userId = User.Identity?.Name;


                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { Message = "Không tìm thấy thông tin người dùng." });
                }

                var medicine = await _medicineService.CreateMedicineAsync(medicineDto, userId);
                return CreatedAtAction(nameof(GetMedicineHistory), new { medicineId = medicine.MedicineID }, medicine);
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi tạo đơn thuốc: " + ex.Message, ex);
            }
        }


        [HttpPut("{medicineId}")]
        [Authorize(Roles = "1,2")] // Nurse, Parent
        public async Task<IActionResult> UpdateMedicine(string medicineId, [FromBody] MedicineUpdateDTO updateDto)
        {
            try
            {
                var userId = User.Identity?.Name;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { Message = "Không tìm thấy thông tin người dùng." });
                }

                var result = await _medicineService.UpdateMedicineAsync(medicineId, updateDto, userId);
                
                if(result == null)
                {
                    return NotFound(new { Message = $"Không tìm thấy đơn thuốc với ID: {medicineId}" });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Đã xảy ra lỗi khi cập nhật đơn thuốc.", Detail = ex.ToString() });
            }
        }


        [HttpPatch("{medicineId}/status")] // Sử dụng PATCH thay vì PUT cho thay đổi trạng thái
        [Authorize(Roles = "2")] // Nurse
        public async Task<IActionResult> ChangeStatus(string medicineId, [FromBody]  ChangeStatusDTO changeStatusDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = User.Identity?.Name;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { Message = "Không tìm thấy thông tin người dùng." });
                }

                var medicine = await _medicineService.ChangeStatusAsync(medicineId,  changeStatusDto, userId);
                return Ok(medicine);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }


        [HttpPost("upload-photo")]
        [Authorize(Roles = "1,2")] // Parent, Nurse
        public async Task<IActionResult> UploadMedicinePhoto([FromForm] ImageUpload fileDto)
        {
            try
            {
                if (!ModelState.IsValid || fileDto.File == null)
                {
                    return BadRequest(new { Message = "Dữ liệu ảnh không hợp lệ." });
                }

                var userId = User.Identity?.Name;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { Message = "Không tìm thấy thông tin người dùng." });
                }

                await _medicineService.AddMedicinePhotoAsync(fileDto, userId);
                return Ok(new { Message = "Ảnh đã được tải lên thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new {           
                    Message = "Lỗi khi tải lên ảnh đơn thuốc.",
                    Detail = ex.InnerException?.Message ?? ex.Message });
            }
        }


        [HttpGet("{medicineId}/history")]
        [Authorize(Roles = "1,2")] // Parent, Nurse
        public async Task<IActionResult> GetMedicineHistory(string medicineId)
        {
            try
            {
                var history = await _medicineService.GetMedicineHistoryAsync(medicineId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }

    public class ChangeStatusDto
    {
        [Required(ErrorMessage = "Trạng thái mới là bắt buộc.")]
        public string NewStatus { get; set; }

        [Required(ErrorMessage = "Mô tả thay đổi là bắt buộc.")]
        public string ChangeDescription { get; set; }
    }
}