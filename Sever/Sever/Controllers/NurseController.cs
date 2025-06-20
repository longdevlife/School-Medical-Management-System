using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.File;
using Sever.DTO.MedicalEvent;
using Sever.DTO.Medicine;
using Sever.DTO.SendMedicine;
using Sever.Service;
using System.Security.Claims;

namespace Sever.Controllers
{

    [ApiController]
    [Route("api/nurse")]
    [Authorize(Roles = "2")]
    public class NurseController : ControllerBase
    {
        private readonly IMedicineService _medicineService;
        private readonly IMedicalEventService _medicalEventService;

        public NurseController(IMedicineService medicineService, IMedicalEventService medicalEventService)
        {
            _medicineService = medicineService;
            _medicalEventService = medicalEventService;

        }

        [HttpPost("medicine/create")]
        public async Task<IActionResult> CreateMedicine([FromForm] CreateMedicine dto)
        {
            var userId = User.Identity?.Name;
            var result = await _medicineService.CreateMedicineByNurseAsync(dto, userId);
            return Ok(result);
        }

        [HttpPut("medicine/update/{id}")]
        public async Task<IActionResult> UpdateMedicine(string id, [FromBody] MedicineStatusUpdate dto)
        {
            var userId = User.Identity?.Name;
            var result = await _medicineService.UpdateMedicineByNurseAsync(id, dto, userId);
            return Ok(result);
        }

        [HttpPost("medicine/upload-image")]
        public async Task<IActionResult> UploadMedicineImage([FromForm] ImageUpload dto)
        {
            var userId = User.Identity?.Name;
            await _medicineService.AddMedicinePhotoAsync(dto, userId);
            return Ok(new { message = "Tải ảnh đơn thuốc thành công." });
        }

        //[HttpGet("medicine/history/{medicineId}")]
        //public async Task<IActionResult> GetMedicineHistory(string medicineId)
        //{
        //    var userId = User.Identity?.Name;
        //    var role = User.FindFirst("role")?.Value;

        //    var histories = await _medicineService.GetMedicineHistoryAsync(medicineId, userId, role);
        //    return Ok(histories);
        //}

        [HttpPost("event/create")]
        public async Task<IActionResult> CreateMedicalEvent([FromForm] CreateMedicalEvent request)
        {
            var userId = User.Identity?.Name;
            var result = await _medicalEventService.CreateMedicalEvent(request, userId);
            return Ok(result);
        }

        //[HttpGet("event/{id}")]
        //public async Task<IActionResult> GetMedicalEvent(string id)
        //{
        //    var userId = User.Identity?.Name;
        //    var result = await _medicalEventService.GetMedicalEvent(id);
        //    if (result == null)
        //        return NotFound("Không tìm thấy sự kiện y tế.");
        //    return Ok(result);
        //}


        [HttpPut("event/update")]
        public async Task<IActionResult> UpdateMedicalEvent([FromForm] MedicalEventUpdateDTO dto)
        {
            await _medicalEventService.UpdateMedicalEvent(dto);
            return NoContent();
        }
    }
}
