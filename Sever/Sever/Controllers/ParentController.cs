using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.File;
using Sever.DTO.SendMedicine;
using Sever.Service;

namespace Sever.Controllers
{
    [ApiController]
    [Route("api/parent")]
    [Authorize(Roles = "1")]
    public class ParentController : ControllerBase
    {
        private readonly IMedicineService _medicineService;
        private readonly IMedicalEventService _medicalEventService;

        public ParentController(IMedicineService medicineService, IMedicalEventService medicalEventService)
        {
            _medicineService = medicineService;
            _medicalEventService = medicalEventService;
        }

        [HttpPost("medicine/create")]
        public async Task<IActionResult> CreateMedicine([FromForm] CreateMedicine dto)
        {
            var userId = User.Identity?.Name;
            var result = await _medicineService.CreateMedicineByParentAsync(dto, userId);
            return Ok(result);
        }

        [HttpPut("medicine/update/{id}")]
        public async Task<IActionResult> UpdateMedicine(string id, [FromForm] MedicineUpdateDTO dto)
        {
            var userId = User.Identity?.Name;
            var result = await _medicineService.UpdateMedicinByParentAsync(dto, id, userId);
            return Ok(result);
        }

        [HttpGet("medicine/getByStudentId/{studentId}")]
        public async Task<IActionResult> GetMedicinesByStudentID(string studentId)
        {
            if (string.IsNullOrEmpty(studentId))
                return BadRequest("Thiếu studentId.");

            var result = await _medicineService.GetMedicinesByStudent(studentId);
            return Ok(result);
        }

        [HttpGet("event/getByStudentId/{studentId}")]
        public async Task<IActionResult> GetMedicalEventsByStudentID(string studentId)
        {
            if (string.IsNullOrEmpty(studentId))
                return BadRequest("Thiếu studentId.");

            var result = await _medicalEventService.GetMedicalEventsByStudentID(studentId);
            return Ok(result);
        }
    }
}
