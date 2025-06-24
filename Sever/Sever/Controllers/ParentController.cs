using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.Appointment;
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
        private readonly IHealthCheckUpService _healthCheckUpService;
        private readonly IAppointmentService _appointmentService;

        public ParentController(IMedicineService medicineService, 
                IMedicalEventService medicalEventService, 
                IHealthCheckUpService healthCheckUpService, 
                IAppointmentService appointmentService)
        {
            _medicineService = medicineService;
            _medicalEventService = medicalEventService;
            _healthCheckUpService = healthCheckUpService;
            _appointmentService = appointmentService;
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

        [HttpGet("medicine/getByStudentId")]
        public async Task<IActionResult> GetMedicinesByStudentID()
        {
            var username = User.Identity?.Name;
            var result = await _medicineService.GetMedicineByParentAsync(username);
            if (result == null)
                return Forbid();
            return Ok(result);
        }


        [HttpGet("event/getByStudentId")]
        public async Task<IActionResult> GetMedicalEventByStudentID()
        {
            var username = User.Identity?.Name;
            var result = await ;

            if (result == null)
                return Forbid();

            return Ok(result);
        }

        [HttpPut("confirm-health-check-up")]
        public async Task<IActionResult> ConfirmHealthCheckUp([FromBody] UpdateAppointment dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("User not authenticated.");
            }
            var result = await _healthCheckUpService.ConfirmHealCheckup(dto.AppointmentID);
            if (result)
            {
                return Ok("Health check-up xác nhận thành công.");
            }
            return BadRequest("Xác nhận health check-up thất bại");
        }

        [HttpPut("confirm-appointment")]
        public async Task<IActionResult> ConfirmAppointment([FromBody] UpdateAppointment dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("User not authenticated.");
            }
            var result = await _appointmentService.ConfirmAppointMent(dto.AppointmentID);
            if (result)
            {
                return Ok("Appointment confirmed successfully.");
            }
            return BadRequest("Failed to confirm appointment.");
        }
    }
}
