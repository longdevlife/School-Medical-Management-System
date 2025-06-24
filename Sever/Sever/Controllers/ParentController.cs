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
            var result = await _medicalEventService.GetMedicialEventByParentAsync(username);

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
                return Unauthorized("Người dùng chưa được cấp quyền.");
            }
            var result = await _healthCheckUpService.ConfirmHealCheckup(dto.AppointmentID);
            if (result)
            {
                return Ok("Xác nhận kiểm tra khám sức khỏe định kì thành công.");
            }
            return BadRequest("Xác nhận kiểm tra khám sức khỏe định kì thất bại");
        }

        [HttpPut("denied-health-check-up")]
        public async Task<IActionResult> DeniedHealthCheckUp([FromBody] UpdateAppointment dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Người dùng chưa được cấp quyền.");
            }
            var result = await _healthCheckUpService.DeniedHealCheckup(dto.AppointmentID);
            if (result)
            {
                return Ok("Từ chối kiểm tra khám sức khỏe định kì thành công.");
            }
            return BadRequest("Từ chối kiểm tra khám sức khỏe định kì thất bại");
        }

        [HttpPut("confirm-appointment")]
        public async Task<IActionResult> ConfirmAppointment([FromBody] UpdateAppointment dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Người dùng chưa được cấp quyền.");
            }
            var result = await _appointmentService.ConfirmAppointMent(dto.AppointmentID);
            if (result)
            {
                return Ok("Đã xác nhận tham gia cuộc hẹn");
            }
            return BadRequest("Thất bại trong việc xác nhận tham gia cuộc hẹn.");
        }

        [HttpPut("denied-appointment")]
        public async Task<IActionResult> DeniedAppointment([FromBody] UpdateAppointment dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Người dùng chưa được cấp quyền.");
            }
            var result = await _appointmentService.DeniedAppointMent(dto.AppointmentID);
            if (result)
            {
                return Ok("Đã từ chối tham gia cuộc hẹn");
            }
            return BadRequest("Thất bại trong việc từ chối tham gia cuộc hẹn.");
        }

        [HttpGet("get-health-check-up-by-parent")]
        public async Task<IActionResult> GetHealthCheckupsByParentId([FromBody] string parentId)
        {
            if (string.IsNullOrEmpty(parentId))
                return BadRequest("Thiếu parentId.");
            var result = await _healthCheckUpService.GetHealthCheckupsByParentIdAsync(parentId);
            return Ok(result);
        }
    }
}
