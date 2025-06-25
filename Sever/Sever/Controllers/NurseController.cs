using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.Appointment;
using Sever.DTO.File;
using Sever.DTO.HealthCheckUp;
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
        private readonly IAppointmentService _appointmentService;
        private readonly IHealthCheckUpService _healthCheckUpService;

        public NurseController(IMedicineService medicineService,
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

        [HttpGet("medicine/getAll")]
        public async Task<IActionResult> GetAllMedicines()
        {
            var result = await _medicineService.GetAllMedicinesAsync();
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

        [HttpPost("create-health-check-up-by-class")]
        public async Task<IActionResult> CreateHealthCheckUpByClass(CreateHealthCheckUp dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            var result = await _healthCheckUpService.CreateHealthCheckupByClassAsync(dto);
            if (!result)
                return BadRequest("Không thể tạo khám sức khỏe cho lớp học này.");
            return Ok(result);
        }

        [HttpGet("get-health-check-up-by-student")]
        public async Task<IActionResult> GetHealthCheckupsByStudentIdA([FromBody] string studentId)
        {
            if (string.IsNullOrEmpty(studentId))
                return BadRequest("Thiếu studentId.");
            var result = await _healthCheckUpService.GetHealthCheckupsByStudentIdAsync(studentId);
            return Ok(result);
        }

        [HttpGet("get-confirm-healcheck-up")]
        public async Task<IActionResult> GetConfirmHealthCheckUp()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            var result = await _healthCheckUpService.GetHealthCheckUpsConfirmAsync();
            if (result == null || !result.Any())
                return NotFound("Không tìm thấy khám sức khỏe nào đã xác nhận.");
            return Ok(result);
        }

        [HttpGet("get-denied-health-check-up")]
        public async Task<IActionResult> GetDeniedHealthCheckUp()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            var result = await _healthCheckUpService.GetHealthCheckUpsDeniedAsync();
            if (result == null || !result.Any())
                return NotFound("Không tìm thấy khám sức khỏe nào bị từ chối.");
            return Ok(result);
        }
        [HttpGet("get-not-response-health-check-up")]
        public async Task<IActionResult> GetNotResponseHealthCheckUp()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            var result = await _healthCheckUpService.GetHealthCheckUpsNotResponseAsync();
            if (result == null)
                return NotFound("Không tìm thấy khám sức khỏe nào chưa phản hồi.");
            return Ok(result);
        }

        [HttpGet("get-health-check-up-by-year")]
        public async Task<IActionResult> GetHealthCheckupsByYear([FromQuery] DateTime dateTime)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            if (dateTime == default)
                return BadRequest("Thiếu thông tin năm.");
            var result = await _healthCheckUpService.GetHealthCheckupsByYearAsync(dateTime);
            if (result == null || !result.Any())
                return NotFound("Không tìm thấy khám sức khỏe nào cho năm này.");
            return Ok(result);
        }

        [HttpPut("update-health-check-up")]
        public async Task<IActionResult> UpdateHealthCheckUp([FromBody] UpdateHealthCheckUp dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            if (dto == null || string.IsNullOrEmpty(dto.HealthCheckId))
                return BadRequest("Thiếu thông tin khám sức khỏe.");
            var result = await _healthCheckUpService.UpdateHealthCheckupAsync(dto);
            if (!result)
                return BadRequest("Cập nhật khám sức khỏe không thành công.");
            return Ok("Cập nhật khám sức khỏe thành công.");
        }

        [HttpPost("create-appointment")]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointment dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            if (dto == null || string.IsNullOrEmpty(dto.HealthCheckUpID) || dto.DateTime == default)
                return BadRequest("Thiếu thông tin cuộc hẹn.");
            var result = await _appointmentService.CreateAppointmentAsync(dto);
            if (!result)
                return BadRequest("Tạo cuộc hẹn không thành công.");
            return Ok("Tạo cuộc hẹn thành công.");
        }

        [HttpPut("update-appointment")]
        public async Task<IActionResult> UpdateAppointment([FromBody] UpdateAppointment dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            if (dto == null || string.IsNullOrEmpty(dto.AppointmentID))
                return BadRequest("Thiếu thông tin cuộc hẹn.");
            var result = await _appointmentService.UpdateAppointmentByIdAsync(dto);
            if (!result)
                return BadRequest("Cập nhật cuộc hẹn không thành công.");
            return Ok("Cập nhật cuộc hẹn thành công.");
        }
    }
}
