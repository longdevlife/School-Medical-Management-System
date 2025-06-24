using Sever.DTO.HealthCheckUp;
using Sever.Model;
using Sever.Repository;
using Sever.Utilities;

namespace Sever.Service
{
    public interface IHealthCheckUpService
    {
        Task<HealthCheckUp> CreateHealthCheckupAsync(CreateHealthCheckUp healthCheckup);
        Task<bool> CreateHealthCheckupByClassAsync(CreateHealthCheckUp newHealthCheckup, string classId, DateTime time);
        Task<bool> UpdateHealthCheckupAsync(UpdateHealthCheckUp healthCheckupUpdate);
        Task<bool> DeleteHealthCheckupAsync(string id);
        Task<HealthCheckUp> GetHealthCheckupByIdAsync(string id);
        Task<List<HealthCheckUp>> GetAllHealthCheckupsAsync();
        Task<List<HealthCheckUp>> GetHealthCheckupsByParentIdAsync(string studentId);
        Task<List<HealthCheckUp>> GetHealthCheckupsByYearAsync(DateTime dateTime);
        Task<List<HealthCheckUp>> GetHealthCheckUpsDeniedAsync();
        Task<List<HealthCheckUp>> GetHealthCheckUpsConfirmAsync();
        Task<List<HealthCheckUp>> GetHealthCheckUpsNotResponseAsync();
        Task<bool> ConfirmHealCheckup(string id);
        Task<bool> DeniedHealCheckup(string id);

    }
    public class HealthCheckUpService : IHealthCheckUpService
    {
        private readonly IHealthCheckupRepository _healthCheckupRepository;
        private readonly IStudentProfileRepository _studentRepository;
        private readonly INotificationService _notificationService;
        private readonly IHealthProfileRepository _healthProfileRepository;
        public HealthCheckUpService(IHealthCheckupRepository healthCheckupRepository,
                                    IStudentProfileRepository studentProfileRepository,
                                    INotificationService notificationService,
                                    IHealthProfileRepository healthProfileRepository)
        {
            _healthCheckupRepository = healthCheckupRepository;
            _studentRepository = studentProfileRepository;
            _notificationService = notificationService;
            _healthProfileRepository = healthProfileRepository;
        }
        public async Task<HealthCheckUp> CreateHealthCheckupAsync(CreateHealthCheckUp newHealthCheckup)
        {
            if (newHealthCheckup == null) throw new ArgumentNullException("Health Check Up cannot be null");
            var healthCheckup = new HealthCheckUp
            {
                HealthCheckUpID = _healthCheckupRepository.NewID(),
                StudentID = newHealthCheckup.StudentID,
                Notes = newHealthCheckup.Note,
                Status = "Chờ xác nhận"
            };

            return await _healthCheckupRepository.CreateHealthCheckupAsync(healthCheckup);
        }
        public async Task<bool> CreateHealthCheckupByClassAsync(CreateHealthCheckUp newHealthCheckup, string classId, DateTime time)
        {
            if (newHealthCheckup == null) throw new ArgumentNullException("Health Check Up cannot be null");
            var listStudent = await _studentRepository.GetStudentProfilesByClassIdAsync(classId);
            if (listStudent == null || listStudent.Count == 0) throw new ArgumentException("No students found in the specified class.");
            try
            {
                foreach (var student in listStudent)
                {
                    var healthCheckup = new HealthCheckUp
                    {
                        HealthCheckUpID = _healthCheckupRepository.NewID(),
                        StudentID = student.StudentID,
                        Notes = newHealthCheckup.Note,
                        Status = "Chờ xác nhận"
                    };
                    await _healthCheckupRepository.CreateHealthCheckupAsync(healthCheckup);
                    await _notificationService.SendHealthCheckupNotificationAsync(student, time);
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error creating health checkups for class: " + ex.Message);
            }
            return true;
        }
        public async Task<bool> UpdateHealthCheckupAsync(UpdateHealthCheckUp healthCheckupUpdate)
        {
            if (healthCheckupUpdate == null) throw new ArgumentNullException("Health Check Up không được để trống");
            var healthCheckUp = await _healthCheckupRepository.GetHealthCheckupByIdAsync(healthCheckupUpdate.HealthCheckId);
            if (healthCheckUp == null) throw new KeyNotFoundException("Không tìm thấy health checkup để cập nhật");
            healthCheckUp.Height = healthCheckupUpdate.Height;
            healthCheckUp.Weight = healthCheckupUpdate.Weight;
            healthCheckUp.BMI = healthCheckupUpdate.BMI;
            healthCheckUp.VisionLeft = healthCheckupUpdate.VisionLeft;
            healthCheckUp.VisionRight = healthCheckupUpdate.VisionRight;
            healthCheckUp.BloodPressure = healthCheckupUpdate.BloodPressure;
            healthCheckUp.Dental = healthCheckupUpdate.Dental;
            healthCheckUp.Skin = healthCheckupUpdate.Skin;
            healthCheckUp.Hearing = healthCheckupUpdate.Hearing;
            healthCheckUp.Respiration = healthCheckupUpdate.Respiration;
            healthCheckUp.Ardiovascular = healthCheckupUpdate.Ardiovascular;
            healthCheckUp.Notes = healthCheckupUpdate.Notes;
            var healthProfile = await _healthProfileRepository.GetHealthProfileByStudentID(healthCheckUp.StudentID);
            if (healthProfile == null) throw new KeyNotFoundException("Không tìm thấy hồ sơ sức khỏe học sinh để cập nhật");
            healthProfile.Height = healthProfile.Height;

            try
            {
                var student = await _studentRepository.SearchStudentProfile(healthCheckUp.StudentID);
                await _healthCheckupRepository.UpdateHealthCheckupAsync(healthCheckUp);
                _notificationService.UpdateHealthCheckUpNotifycationAsync(student);
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi update health checkup: " + ex.Message);

                return false;
            }
        }
        public async Task<bool> DeleteHealthCheckupAsync(string id)
        {
            return await _healthCheckupRepository.DeleteHealthCheckupAsync(id);
        }
        public async Task<HealthCheckUp> GetHealthCheckupByIdAsync(string id)
        {
            return await _healthCheckupRepository.GetHealthCheckupByIdAsync(id);
        }
        public async Task<List<HealthCheckUp>> GetAllHealthCheckupsAsync()
        {
            return await _healthCheckupRepository.GetAllHealthCheckupsAsync();
        }
        public async Task<List<HealthCheckUp>> GetHealthCheckupsByParentIdAsync(string parentId)
        {
            var students = await _studentRepository.GetStudentProfileByParentId(parentId);
            if (students == null || students.Count == 0)
                throw new KeyNotFoundException("Không tìm thấy học sinh cho phụ huynh này");

            var tasks = students.Select(s => _healthCheckupRepository.GetHealthCheckupsByStudentIdAsync(s.StudentID));
            var healthCheckupsList = await Task.WhenAll(tasks);

            return healthCheckupsList.SelectMany(list => list).ToList();
        }
        public async Task<List<HealthCheckUp>> GetHealthCheckupsByYearAsync(DateTime dateTime)
        {
            return await _healthCheckupRepository.GetHealthCheckupsByYearAsync(dateTime);
        }
        public async Task<List<HealthCheckUp>> GetHealthCheckUpsDeniedAsync()
        {
            return await _healthCheckupRepository.GetHealthCheckUpsDeniedAsync();
        }
        public async Task<List<HealthCheckUp>> GetHealthCheckUpsConfirmAsync()
        {
            return await _healthCheckupRepository.GetHealthCheckUpsConfirmAsync();
        }
        public async Task<List<HealthCheckUp>> GetHealthCheckUpsNotResponseAsync()
        {
            return await _healthCheckupRepository.GetHealthCheckUpsNotResponseAsync();
        }
        public async Task<bool> ConfirmHealCheckup(string id)
        {
            var healthCheckUp = await _healthCheckupRepository.GetHealthCheckupByIdAsync(id);
            return await _healthCheckupRepository.UpdateStatus(healthCheckUp, "Đã Xác Nhận");
        }
        public async Task<bool> DeniedHealCheckup(string id)
        {
            var healthCheckUp = await _healthCheckupRepository.GetHealthCheckupByIdAsync(id);
            return await _healthCheckupRepository.UpdateStatus(healthCheckUp, "Đã Từ Chối");
        }
    }
}
