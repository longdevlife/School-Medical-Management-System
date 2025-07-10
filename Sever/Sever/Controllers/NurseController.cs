using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.Appointment;
using Sever.DTO.File;
using Sever.DTO.HealthCheckUp;
using Sever.DTO.HealthProfile;
using Sever.DTO.MedicalEvent;
using Sever.DTO.Medicine;
using Sever.DTO.SendMedicine;
using Sever.DTO.Vaccination;
using Sever.Model;
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
        private readonly IVaccinationService _vaccinationService;
        private readonly IHealthProfileService _healthProfileService;


        public NurseController(IMedicineService medicineService,
            IMedicalEventService medicalEventService,
            IHealthCheckUpService healthCheckUpService,
            IAppointmentService appointmentService,
            IVaccinationService vaccinationService,
            IHealthProfileService healthProfileService)
        {
            _medicineService = medicineService;
            _medicalEventService = medicalEventService;
            _healthCheckUpService = healthCheckUpService;
            _appointmentService = appointmentService;
            _vaccinationService = vaccinationService;
            _healthProfileService = healthProfileService;
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

        [HttpPut("medicine/addImage/{id}")]
        public async Task<IActionResult> AddImage(string id, [FromForm] MedicineStatusUpdate dto)
        {
            var username = User.Identity?.Name;
            var result = await _medicineService.AddImageByNurseIDAsync(id, dto, username);
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

        [HttpPut("event/addImages/{id}")]
        public async Task<IActionResult> AddImageMedicalEvent([FromForm] MedicalEventUpdateDTO dto, string id)
        {
            var username = User.Identity?.Name;
            var result = await _medicalEventService.AddImage(dto, id, username);
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

        [HttpGet("event/getAll")]
        public async Task<IActionResult> GetAllMedicalEvent()
        {
            var result = await _medicalEventService.GetAllMedicialEventAsync();
            return Ok(result);
        }

        [HttpPost("create-health-check-up-by-class")]
        public async Task<IActionResult> CreateHealthCheckUpByClass([FromForm] string classId, [FromForm] DateTime dateCheckUp)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            var result = await _healthCheckUpService.CreateHealthCheckupByClassAsync(classId, dateCheckUp);
            if (!result)
                return BadRequest("Không thể tạo khám sức khỏe cho lớp học này.");
            return Ok(result);
        }

        [HttpGet("get-health-check-up-by-student/{studentId}")]
        public async Task<IActionResult> GetHealthCheckupsByStudentId(string studentId)
        {
            if (string.IsNullOrEmpty(studentId))
                return BadRequest("Thiếu studentId.");
            var result = await _healthCheckUpService.GetHealthCheckupsByStudentIdAsync(studentId);
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

        [HttpGet("get-health-check-up-by-year/{year}")]
        public async Task<IActionResult> GetHealthCheckupsByYear(int year)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            if (year == default)
                return BadRequest("Thiếu thông tin năm.");
            var result = await _healthCheckUpService.GetHealthCheckupsByYearAsync(year);
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


        [HttpPost("vaccine/createByStudentID")]
        public async Task<IActionResult> CreateVaccination([FromForm] CreateVaccination dto)
        {
            var username = User.Identity?.Name;
            var result = await _vaccinationService.CreateVaccinationRecordByStudentIDAsync(dto, username);
            return Ok(result);
        }


        [HttpPost("vaccine/createByClassID")]
        public async Task<IActionResult> CreateVaccinationByClassID([FromForm] CreateVaccination dto)
        {
            var username = User.Identity?.Name;
            var result = await _vaccinationService.CreateVaccinationRecordByClassIDAsync(dto, username);
            return Ok(result);
        }

        [HttpPut("vaccine/updateByRecordID/{recordId}")]
        public async Task<IActionResult> UpdateVaccination(string recordId, [FromForm] UpdateVaccineDTO dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            var result = await _vaccinationService.UpdateVaccinationRecordAsync(dto, username, recordId);
            if (!result)
                return BadRequest("Cập nhật tiêm chủng không thành công.");
            return Ok("Cập nhật tiêm chủng thành công.");
        }

        [HttpPut("vaccine/updateAfterByRecordID/{recordId}")]
        public async Task<IActionResult> UpdateAfterVaccination(string recordId, [FromForm] UpdateVaccineAfterDTO dto)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            var result = await _vaccinationService.UpdateVaccinationRecordAfterAsync(dto, username, recordId);
            if (!result)
                return BadRequest("Cập nhật tiêm chủng không thành công.");
            return Ok("Cập nhật tiêm chủng thành công.");
        }

        [HttpGet("vaccine/getAll")]
        public async Task<IActionResult> GetAllVaccine()
        {
            var result = await _vaccinationService.GetAllVaccineRecordAsync();
            return Ok(result);
        }

        [HttpGet("vaccine/getConfirm")]
        public async Task<IActionResult> GetConfirmVaccine()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            var result = await _vaccinationService.GetVaccineConfirmAsync();
            if (result == null || !result.Any())
                return NotFound("Không tìm thấy tiêm chủng nào đã xác nhận.");
            return Ok(result);
        }

        [HttpGet("vaccine/getDenied")]
        public async Task<IActionResult> GetDeniedVaccine()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            var result = await _vaccinationService.GetVaccineDeniedAsync();
            if (result == null || !result.Any())
                return NotFound("Không tìm thấy tiêm chủng nào bị từ chối.");
            return Ok(result);
        }

        [HttpGet("vaccine/getNotResponse")]
        public async Task<IActionResult> GetNotResponseVaccine()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            var result = await _vaccinationService.GetVaccineNotResponseAsync();
            if (result == null || !result.Any())
                return NotFound("Không tìm thấy tiêm chủng nào đang chờ xác nhận.");
            return Ok(result);
        }
        [HttpGet("vaccine/getByStudentId/{studentId}")]
        public async Task<IActionResult> GetVaccineByStudentId(string studentId)
        {
            var result = await _vaccinationService.GetVaccineByStudentIDAsync(studentId);
            return Ok(result);
        }


        [HttpGet("healthProfile/getByStudent/{studentId}")]
        public async Task<IActionResult> GetHealthProfile(string studentId)
        {
            var result = await _healthProfileService.GetHealthProfileByStudentIdAsync(studentId);
            return Ok(result);
        }

        [HttpPut("healthProfile/update")]
        public async Task<IActionResult> UpdateHealthProfile([FromBody] UpdateHealthProfile updateDto)
        {
            var userName = User.Identity?.Name;
            if (string.IsNullOrEmpty(userName))
                return Unauthorized("Bạn cần đăng nhập để thực hiện hành động này.");
            var success = await _healthProfileService.UpdateHealthProfileAsync(updateDto, userName);
            if (!success) return BadRequest("Cập nhật thất bại.");
            return Ok("Cập nhật thành công và đã thông báo cho phụ huynh.");
        }

        [HttpGet("healthProfile/getAll")]
        public async Task<IActionResult> GetAllHealthProfiles()
        {
            var result = await _healthProfileService.GetAllHealthProfilesAsync();
            return Ok(result);
        }
        [HttpGet("get-all-health-check-up")]
        public async Task<IActionResult> GetAllHealthCheckUp()
        {
            try
            {
                var healthCheckup = await _healthCheckUpService.GetAllHealthCheckupsAsync();
                if (healthCheckup != null)
                {
                    return Ok(healthCheckup);
                }
                else
                {
                    return NotFound("Lấy danh sách khám sức khỏe thất bại.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi Khi lấy danh sách khám sức khỏe" + ex.Message);
            }
        }
        [HttpPut("update-waiting-status-health-check-up/{Id}")]
        public async Task<IActionResult> UpdateWaitingStatusHealthCheckUp(string Id)
        {
            try
            {
                if (string.IsNullOrEmpty(Id))
                {
                    return BadRequest("Thiếu thông tin khám sức khỏe.");
                }
                var result = await _healthCheckUpService.WaitingHealthCheckUp(Id);
                if (result)
                {
                    return Ok("Cập nhật trạng thái chờ thành công.");
                }
                else
                {
                    return BadRequest("Cập nhật trạng thái chờ không thành công.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi khi cập nhật trạng thái chờ: " + ex.Message);
            }
        }
        [HttpGet("get-all-appointment")]
        public async Task<IActionResult> GetAllAppointmentAsync()
        {
            try
            {
                var results = await _appointmentService.GetAllAppointmentAsync();
                if (results != null)
                {
                    return Ok(results);
                }
                else
                {
                    return NotFound("Không có danh sách cuộc hẹn nào được lưu trữ");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Tải cuộc hẹn thất bại" + ex.Message);
            }
        }
    }
}
