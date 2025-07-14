using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO.News;
using Sever.DTO.User;
using Sever.Service;

namespace Sever.Controllers
{
    [Authorize(Roles = "3")]
    [Route("api/manager")]
    [ApiController]
    public class ManagerController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IStudentService _studentService;
        private readonly INewsService _newsService;
        private readonly IHealthCheckUpService _healthCheckUpService;
        private readonly IMedicineService _medicineService;
        private readonly IMedicalEventService _medicalEventService;
        private readonly IVaccinationService _vaccinationService;
        public ManagerController(IStudentService studentService,
            IUserService userService,
            INewsService newsService,
            IHealthCheckUpService healthCheckUpService,
            IMedicineService medicineService,
            IMedicalEventService medicalEvent,
            IVaccinationService vaccinationService)
        {
            _studentService = studentService;
            _userService = userService;
            _newsService = newsService;
            _healthCheckUpService = healthCheckUpService;
            _medicineService = medicineService;
            _medicalEventService = medicalEvent;
            _vaccinationService = vaccinationService;
        }

        [HttpGet("search-student-profile/{info}")]
        public async Task<IActionResult> SearchStudentProfile(string info)
        {
            if (string.IsNullOrEmpty(info))
            {
                return BadRequest(new { message = "Thông tin học sinh không được để trống" });
            }
            try
            {
                var studentProfile = await _studentService.SearchStudentProfileAsync(info);
                if (studentProfile == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin học sinh" });
                }
                return Ok(studentProfile);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi tìm kiếm thông tin học sinh: {ex.Message}" });
            }
        }
        [HttpGet("get-news-by-manager")]
        public async Task<IActionResult> GetNewsByManager()
        {
            string username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "Không tìm thấy thông tin người dùng" });
            }
            var user = await _userService.GetUserAsyc(username);
            try
            {
                var news = await _newsService.GetNewsByUserIdAsync(user.UserID);
                if (news == null)
                {
                    return NotFound(new { message = "Không có tin tức nào để hiển thị" });
                }
                return Ok(news);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi lấy tin tức: {ex.Message}" });
            }
        }

        [HttpPost("create-news")]
        public async Task<IActionResult> CreateNews(CreateNews newNews)
        {
            string username = User.Identity?.Name;
            if (newNews == null)
            {
                return BadRequest(new { message = "Thông tin tin tức không được để trống" });
            }
            try
            {
                var user = await _userService.GetUserAsyc(username);
                var news = await _newsService.CreateNewsAsync(newNews, user.UserID);
                return CreatedAtAction(nameof(GetNewsByManager), new { id = news.NewsID }, news);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi tạo tin tức: {ex.Message}" });
            }
        }

        [HttpPut("update-news")]
        public async Task<IActionResult> UpdateNews([FromForm] UpdateNews updateNews)
        {
            if (updateNews == null || string.IsNullOrEmpty(updateNews.NewsID))
            {
                return BadRequest(new { message = "Thông tin tin tức không hợp lệ" });
            }
            try
            {
                var result = await _newsService.UpdateNewsAsync(updateNews);
                if (result)
                {
                    return Ok(new { message = "Cập nhật tin tức thành công" });
                }
                else
                {
                    return NotFound(new { message = "Không tìm thấy tin tức để cập nhật" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi cập nhật tin tức: {ex.Message}" });
            }
        }

        [HttpDelete("delete-news/{id}")]
        public async Task<IActionResult> DeleteNews(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { message = "ID tin tức không được để trống" });
            }
            try
            {
                var result = await _newsService.DeleteNewsByIdAsync(id);
                if (result)
                {
                    return Ok(new { message = "Xóa tin tức thành công" });
                }
                else
                {
                    return NotFound(new { message = "Không tìm thấy tin tức để xóa" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi xóa tin tức: {ex.Message}" });
            }
        }
        [HttpGet("generate-report")]
        public async Task<IActionResult> GenerateReport(DateTime fromDate, DateTime toDate)
        {
            try
            {
                var confirmHealthCheckUp = await _healthCheckUpService.CountConfirmHealthCheckUpByDate(fromDate, toDate);
                var deniedHealthCheckUp = await _healthCheckUpService.CountDeniedHealthCheckUpByDate(fromDate, toDate);
                var notResponseHealthCheckUp = await _healthCheckUpService.CountNotResponseHealthCheckUpByDate(fromDate, toDate);
                var totalHealthCheckUp = await _healthCheckUpService.CountHealthCheckUpByDate(fromDate, toDate);
                var countMedicine = await _medicineService.TotalMedicinesAsync(fromDate, toDate);
                var totalMedicalEvent = await _medicalEventService.TotalMedicalEvent(fromDate, toDate);
                var emergencyCount = await _medicalEventService.CountEmergency(fromDate, toDate);
                var accidentCount = await _medicalEventService.CountAccident(fromDate, toDate);
                var illnessCount = await _medicalEventService.CountIllness(fromDate, toDate);
                var otherCount = await _medicalEventService.CountOther(fromDate, toDate);
                var injuryCount = await _medicalEventService.CountInjury(fromDate, toDate);
                var totalVaccine = await _vaccinationService.TotalVaccine(fromDate, toDate);
                var countConfirmVaccines = await _vaccinationService.CountConfirmVaccine(fromDate, toDate);
                var countDeniedVaccines = await _vaccinationService.CountDeniedVaccine(fromDate, toDate);
                var countNotResponseVaccines = await _vaccinationService.CountNotResponseVaccine(fromDate, toDate);
                var countActiveNews = await _newsService.CountActiveNewsAsync(fromDate, toDate);
                var countInActiveNews = await _newsService.CountInActiveNewsAsync(fromDate, toDate);
                return Ok(new
                {
                    TotalHealthCheckUp = totalHealthCheckUp,
                    ConfirmHealthCheckUp = confirmHealthCheckUp,
                    DeniedHealthCheckUp = deniedHealthCheckUp,
                    NotResponseHealthCheckUp = notResponseHealthCheckUp,
                    TotalMedicine = countMedicine,
                    TotalMedicalEvent = totalMedicalEvent,
                    EmergencyCount = emergencyCount,
                    AccidentCount = accidentCount,
                    IllnessCount = illnessCount,
                    OtherCount = otherCount,
                    InjuryCount = injuryCount,
                    TotalVaccineRecord = totalVaccine,
                    CountConfirmVaccines = countConfirmVaccines,
                    CountDeniedVaccines = countDeniedVaccines,
                    CountNotResponseVaccines = countNotResponseVaccines,
                    CountActiveNews  = countActiveNews,
                    CountInActiveNews = countInActiveNews
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi tạo báo cáo: {ex.Message}" });
            }
        }
        [HttpGet("get-all-student")]
        public async Task<IActionResult> GetAllStudent()
        {
            try
            {
                var results = await _studentService.GetAllStudentInfo();
                if (results == null)
                {
                    return NotFound("Không tìm thấy học sinh");
                }
                else
                {
                    return Ok(results);
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Thất bại khi tải danh sách học sinh" + ex.Message);
            }
        }
    }
}
