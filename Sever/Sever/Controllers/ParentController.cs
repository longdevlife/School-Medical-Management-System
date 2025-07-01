using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.Appointment;
using Sever.DTO.File;
using Sever.DTO.HealProfile;
using Sever.DTO.HealthCheckUp;
using Sever.DTO.SendMedicine;
using Sever.DTO.Vaccination;
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
        private readonly IVaccinationService _vaccinationService;
        private readonly IStudentService _studentService;
        private readonly IUserService _userService;
        private readonly IHealthProfileService _healthProfileService;
        public ParentController(IMedicineService medicineService,
                IMedicalEventService medicalEventService,
                IHealthCheckUpService healthCheckUpService,
                IAppointmentService appointmentService,
                IVaccinationService vaccinationService,
                IStudentService studentService,
                IUserService userService,
                IHealthProfileService healthProfileService)
        {
            _medicineService = medicineService;
            _medicalEventService = medicalEventService;
            _healthCheckUpService = healthCheckUpService;
            _appointmentService = appointmentService;
            _vaccinationService = vaccinationService;
            _studentService = studentService;
            _userService = userService;
            _healthProfileService = healthProfileService;
        }

        [HttpPost("medicine/create")]
        public async Task<IActionResult> CreateMedicine([FromForm] CreateMedicine dto)
        {
            var username = User.Identity?.Name;
            var result = await _medicineService.CreateMedicineByParentAsync(dto, username);
            return Ok(result);
        }

        [HttpPut("medicine/update")]
        public async Task<IActionResult> UpdateMedicine([FromForm] MedicineUpdateDTO dto)
        {
            var username = User.Identity?.Name;
            var result = await _medicineService.UpdateMedicinByParentAsync(dto, username);
            return Ok(result);
        }

        [HttpGet("medicine/getByStudentId")]
        public async Task<IActionResult> GetMedicinesByStudentID()
        {
            var username = User.Identity?.Name;
            var result = await _medicineService.GetMedicinesByStudentAsync(username);
            return Ok(result);
        }

        [HttpGet("medicine/getByParentId")]
        public async Task<IActionResult> GetMedicinesByParentID()
        {
            var username = User.Identity?.Name;
            var result = await _medicineService.GetMedicineByParentAsync(username);
            return Ok(result);
        }

        [HttpGet("event/getByStudentId")]
        public async Task<IActionResult> GetMedicalEventByStudentID()
        {
            var username = User.Identity?.Name;
            var result = await _medicalEventService.GetMedicialEventByParentAsync(username);
            return Ok(result);
        }

        [HttpPut("confirm-health-check-up")]
        public async Task<IActionResult> ConfirmHealthCheckUp(HealthCheckUpResponse dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Người dùng chưa được cấp quyền.");
            }
            var result = await _healthCheckUpService.ConfirmHealCheckup(dto.HeathCheckUpID);
            if (result)
            {
                return Ok("Xác nhận kiểm tra khám sức khỏe định kì thành công.");
            }
            return BadRequest("Xác nhận kiểm tra khám sức khỏe định kì thất bại");
        }

        [HttpPut("denied-health-check-up")]
        public async Task<IActionResult> DeniedHealthCheckUp(HealthCheckUpResponse dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Người dùng chưa được cấp quyền.");
            }
            var result = await _healthCheckUpService.DeniedHealCheckup(dto.HeathCheckUpID);
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
            var result = await _appointmentService.ConfirmAppointMent(dto);
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
            var result = await _appointmentService.DeniedAppointMent(dto);
            if (result)
            {
                return Ok("Đã từ chối tham gia cuộc hẹn");
            }
            return BadRequest("Thất bại trong việc từ chối tham gia cuộc hẹn.");
        }

        [HttpGet("get-all-health-check-up-by-parent/{parentId}")]
        public async Task<IActionResult> GetHealthCheckupsByParentId(string parentId)
        {
            if (string.IsNullOrEmpty(parentId))
                return BadRequest("Thiếu parentId.");
            var result = await _healthCheckUpService.GetHealthCheckupsByParentIdAsync(parentId);
            return Ok(result);
        }

        [HttpPut("vaccine/confirm")]
        public async Task<IActionResult> ConfirmVaccine([FromBody] VaccineReponse dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Người dùng chưa được cấp quyền.");
            }
            var result = await _vaccinationService.ConfirmVaccination(dto.RecordID);
            if (result)
            {
                return Ok("Xác nhận tiêm chủng thành công.");
            }
            return BadRequest("Xác nhận tiêm chủng thất bại");
        }

        [HttpPut("vaccine/denied")]
        public async Task<IActionResult> DeniedVaccine([FromBody] VaccineReponse dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Người dùng chưa được cấp quyền.");
            }
            var result = await _vaccinationService.DeniedVaccination(dto.RecordID);
            if (result)
            {
                return Ok("Từ chối tiêm chủng thành công.");
            }
            return BadRequest("Từ chối tiêm chủng thất bại");
        }

        [HttpGet("vaccine/getParentId")]
        public async Task<IActionResult> GetVaccineByParentId()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập.");
            var result = await _vaccinationService.GetVaccineByParentUsernameAsync(username);
            return Ok(result);
        }
        [HttpGet("get-student-info-by-parent")]
        public async Task<IActionResult> GetStudentInfoByParent()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Người dùng chưa được cấp quyền.");
            }
            var parent = await _userService.GetUserAsyc(username);
            if (parent == null)
            {
                return BadRequest(new { message = "Không tìm thấy thông tin phụ huynh." });
            }

            var student = await _studentService.GetStudentProfilesByParentAsync(parent.UserID);
            if (student == null)
            {
                return NotFound(new { message = "Không tìm thấy thông tin học sinh." });
            }
            return Ok(student);

        }
        [HttpPut("declare-health-profile")]
        public async Task<IActionResult> DeclareStudentHealthProfile(DeclareHealthProfile healthProfile)
        {
            if (healthProfile == null)
            {
                return BadRequest("Health Profile không được để trống.");
            }
            try
            {
                var result = await _healthProfileService.DelareHealthProfileAsync(healthProfile);
                if (result)
                {
                    return Ok("Đã khai báo hồ sơ sức khỏe cho học sinh thành công.");
                }
                else { return BadRequest("Khai báo hồ sơ sức khỏe cho học sinh thất bại."); }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi khai báo hồ sơ sức khỏe: {ex.Message}" });
            }
        }
    }
}
