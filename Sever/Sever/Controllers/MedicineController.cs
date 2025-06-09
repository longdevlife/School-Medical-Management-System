using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.File;
using Sever.DTO.SendMedicine;
using Sever.Repository;

namespace Sever.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicineController : ControllerBase
    {
        private readonly IMedicineService _medicineService;

        public MedicineController(IMedicineService medicineService)
        {
            _medicineService = medicineService;
        }

        [HttpPost]
        [Authorize(Roles = "1,2")] // Nurse, Parent
        public async Task<IActionResult> CreateMedicine([FromBody] MedicineDTO medicineDto)
        {
            var userId = User.FindFirst("sub")?.Value;
            var medicine = await _medicineService.CreateMedicineAsync(medicineDto, userId);
            return CreatedAtAction(nameof(GetMedicineHistory), new { medicineId = medicine.MedicineID }, medicine);
        }

        [HttpPut("{medicineId}")]
        [Authorize(Roles = "2")] // Nurse
        public async Task<IActionResult> UpdateMedicine(string medicineId, [FromBody] MedicineUpdateDTO updateDto)
        {
            var userId = User.FindFirst("sub")?.Value;
            var medicine = await _medicineService.UpdateMedicineAsync(medicineId, updateDto, userId);
            return Ok(medicine);
        }

        [HttpPut("{medicineId}/status")]
        [Authorize(Roles = "2")] //Nurse
        public async Task<IActionResult> ChangeStatus(string medicineId, [FromBody] ChangeStatusDto statusDto)
        {
            var userId = User.FindFirst("sub")?.Value;
            var medicine = await _medicineService.ChangeStatusAsync(medicineId, statusDto.NewStatus, userId, statusDto.ChangeDescription);
            return Ok(medicine);
        }

        [HttpPost("upload-photo")]
        [Authorize(Roles = "1,2")] // Nurse, Parent
        public async Task<IActionResult> UploadMedicinePhoto([FromForm] ImageUpload fileDto)
        {
            var userId = User.FindFirst("sub")?.Value;
            await _medicineService.AddMedicinePhotoAsync(fileDto, userId);
            return Ok();
        }

        [HttpGet("{medicineId}/history")]
        [Authorize(Roles = "1,2")] // Nurse, Parent
        public async Task<IActionResult> GetMedicineHistory(string medicineId)
        {
            var history = await _medicineService.GetMedicineHistoryAsync(medicineId);
            return Ok(history);
        }
    }

    public class ChangeStatusDto
    {
        public string NewStatus { get; set; }
        public string ChangeDescription { get; set; }
    }
}

