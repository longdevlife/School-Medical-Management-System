using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.File;
using Sever.DTO.SendMedicine;
using Sever.Service;
using System.Security.Claims;

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
            var username = User.Identity?.Name;
            var result = await _medicineService.CreateMedicineByParentAsync(dto, username);
            return Ok(result);
        }

        [HttpPut("medicine/update/{id}")]
        public async Task<IActionResult> UpdateMedicine(string id, [FromForm] MedicineUpdateDTO dto)
        {
            var username = User.Identity?.Name;
            var result = await _medicineService.UpdateMedicinByParentAsync(dto, id, username);
            return Ok(result);
        }

        [HttpGet("medicine/getByStudentId/{studentId}")]
        public async Task<IActionResult> GetMedicinesByStudentID(string studentId)
        {
            var username = User.Identity?.Name;
            var result = await _medicineService.GetMedicineByStudentForParentAsync(studentId, username);

            if (result == null)
                return Forbid();

            return Ok(result);
        }


        [HttpGet("event/getByStudentId/{studentId}")]
        public async Task<IActionResult> GetMedicalEventByStudentID(string studentId)
        {
            var username = User.Identity?.Name;
            var result = await _medicalEventService.GetMedicalEventsByStudentIDP(studentId, username);

            if (result == null)
                return Forbid();

            return Ok(result);
        }
    }
}
