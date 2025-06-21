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
        public async Task<IActionResult> UpdateMedicine(string id, [FromForm] MedicineStatusUpdate dto)
        {
            var userId = User.Identity?.Name;
            var result = await _medicineService.UpdateMedicineByNurseAsync(id, dto, userId);
            return Ok(result);
        }


        [HttpPost("event/create")]
        public async Task<IActionResult> CreateMedicalEvent([FromForm] CreateMedicalEvent request)
        {
            var userId = User.Identity?.Name;
            var result = await _medicalEventService.CreateMedicalEvent(request, userId);
            return Ok(result);
        }


        [HttpPut("event/update/{id}")]
        public async Task<IActionResult> UpdateMedicalEvent([FromForm] MedicalEventUpdateDTO dto, string id)
        {
            var userId = User.Identity?.Name;
            var result = await _medicalEventService.UpdateMedicalEvent(dto, id, userId);
            return Ok(result);
        }
    }
}
