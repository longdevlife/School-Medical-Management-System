using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.File;
using Sever.DTO.MedicalEvent;
using Sever.DTO.Medicine;
using Sever.DTO.SendMedicine;
using Sever.Service;
using System.Diagnostics;
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
            var username = User.Identity?.Name;
            var result = await _medicineService.CreateMedicineByNurseAsync(dto, username);
            return Ok(result);
        }

        [HttpPut("medicine/update/{id}")]
        public async Task<IActionResult> UpdateMedicine(string id, [FromForm] MedicineStatusUpdate dto)
        {
            var username = User.Identity?.Name;
            var result = await _medicineService.UpdateMedicineByNurseAsync(id, dto, username);
            return Ok(result);
        }

        [HttpGet("medicine/getByStudentId/{studentId}")]
        public async Task<IActionResult> GetMedicinesByStudentID(string studentId)
        {
            if (string.IsNullOrEmpty(studentId))
                return BadRequest("Thiếu studentId.");
            var result = await _medicineService.GetMedicinesByStudentAsync(studentId);
            return Ok(result);
        }

        [HttpPost("event/create")]
        public async Task<IActionResult> CreateMedicalEvent([FromForm] CreateMedicalEvent request)
        {
            var username = User.Identity?.Name;
            var result = await _medicalEventService.CreateMedicalEvent(request, username);
            return Ok(result);
        }


        [HttpPut("event/update/{id}")]
        public async Task<IActionResult> UpdateMedicalEvent([FromForm] MedicalEventUpdateDTO dto, string id)
        {
            var username = User.Identity?.Name;
            var result = await _medicalEventService.UpdateMedicalEvent(dto, id, username);
            return Ok(result);
        }

        [HttpGet("event/getByEventId/{medicalEventId}")]
        public async Task<IActionResult> GetMedicalEventById(string medicalEventId)
        {
            var result = await _medicalEventService.GetMedicalEvent(medicalEventId);
            if (result == null)
                return NotFound("Không tìm thấy sự kiện y tế.");

            return Ok(result);
        }

        [HttpGet("event/getByStudentId/{studentId}")]
        public async Task<IActionResult> GetMedicalEventsByStudentId(string studentId)
        {
            var result = await _medicalEventService.GetMedicalEventsByStudentID(studentId);
            return Ok(result);
        }


    }
}
