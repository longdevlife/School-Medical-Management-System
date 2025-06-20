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
        public async Task<IActionResult> CreateMedicine([FromBody] CreateMedicine dto)
        {
            var userId = User.Identity?.Name;
            var result = await _medicineService.CreateMedicineByParentAsync(dto, userId);
            return Ok(result);
        }

        [HttpPut("medicine/update/{id}")]
        public async Task<IActionResult> UpdateMedicine(string id, [FromBody] MedicineUpdateDTO dto)
        {
            var userId = User.Identity?.Name;
            var result = await _medicineService.UpdateMedicineByParentAsync(id, dto, userId);
            return Ok(result);
        }

        [HttpGet("medical-event/history")]
        public async Task<IActionResult> GetMedicalEventHistory()
        {
            var parentId = User.Identity?.Name;
            if (string.IsNullOrEmpty(parentId))
                return Unauthorized("Không xác định được người dùng.");

            var result = await _medicalEventService.GetMedicalEventsByParent(parentId);
            return Ok(result);
        }
    }
}
