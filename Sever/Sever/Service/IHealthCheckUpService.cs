using Microsoft.Extensions.Diagnostics.HealthChecks;
using Sever.DTO.HealthCheckUp;
using Sever.DTO.Vaccination;
using Sever.Model;
using Sever.Repository;
using Sever.Utilities;

namespace Sever.Service
{
    public interface IHealthCheckUpService
    {
        Task<HealthCheckUp> CreateHealthCheckupAsync(CreateHealthCheckUp healthCheckup);
        Task<bool> CreateHealthCheckupByClassAsync(string classId, DateTime dateCheckUp);
        Task<bool> UpdateHealthCheckupAsync(UpdateHealthCheckUp healthCheckupUpdate, string checkerId);
        Task<bool> DeleteHealthCheckupAsync(string id);
        Task<GetHealthCheckup> GetHealthCheckupByIdAsync(string id);
        Task<List<GetHealthCheckup>> GetHealthCheckupsByStudentIdAsync(string parentId);
        Task<List<GetHealthCheckup>> GetAllHealthCheckupsAsync();
        Task<List<HealthCheckUp>> GetHealthCheckupsByParentIdAsync(string studentId);
        Task<List<GetHealthCheckup>> GetHealthCheckupsByYearAsync(int year);
        Task<List<GetHealthCheckup>> GetHealthCheckUpsDeniedAsync();
        Task<List<GetHealthCheckup>> GetHealthCheckUpsConfirmAsync();
        Task<List<GetHealthCheckup>> GetHealthCheckUpsNotResponseAsync();
        Task<bool> ConfirmHealCheckup(string id);
        Task<bool> DeniedHealCheckup(string id);
        Task<bool> WaitingHealthCheckUp(string id);
        Task<int> CountHealthCheckUpByDate(DateTime fromDate, DateTime toDate);
        Task<int> CountConfirmHealthCheckUpByDate(DateTime fromDate, DateTime toDate);
        Task<int> CountDeniedHealthCheckUpByDate(DateTime fromDate, DateTime toDate);
        Task<int> CountNotResponseHealthCheckUpByDate(DateTime fromDate, DateTime toDate);

    }
    public class HealthCheckUpService : IHealthCheckUpService
    {
        private readonly IHealthCheckupRepository _healthCheckupRepository;
        private readonly IStudentProfileRepository _studentRepository;
        private readonly INotificationService _notificationService;
        private readonly IHealthProfileRepository _healthProfileRepository;
        private readonly IEmailService _emailService;
        private readonly IUserService _userService;
        private readonly ISchoolInfoService _schoolInfoService;
        public HealthCheckUpService(IHealthCheckupRepository healthCheckupRepository,
                                    IStudentProfileRepository studentProfileRepository,
                                    INotificationService notificationService,
                                    IHealthProfileRepository healthProfileRepository,
                                    IEmailService emailService,
                                    IUserService userService,
                                    ISchoolInfoService schoolInfoService)
        {
            _healthCheckupRepository = healthCheckupRepository;
            _studentRepository = studentProfileRepository;
            _notificationService = notificationService;
            _healthProfileRepository = healthProfileRepository;
            _emailService = emailService;
            _userService = userService;
            _schoolInfoService = schoolInfoService;
        }
        public async Task<HealthCheckUp> CreateHealthCheckupAsync(CreateHealthCheckUp newHealthCheckup)
        {
            if (newHealthCheckup == null) throw new ArgumentNullException("Health Check Up cannot be null");
            var healthCheckup = new HealthCheckUp
            {
                HealthCheckUpID = _healthCheckupRepository.NewID(),
                StudentID = newHealthCheckup.StudentID,
                CheckDate = newHealthCheckup.DateCheckUp,
                Notes = newHealthCheckup.Note,
                Status = "Chờ xác nhận"
            };

            return await _healthCheckupRepository.CreateHealthCheckupAsync(healthCheckup);
        }
        public async Task<bool> CreateHealthCheckupByClassAsync(string classID, DateTime dateCheckUp)
        {
            var listStudent = await _studentRepository.GetStudentProfilesByClassIdAsync(classID);
            var schoolInfo = await _schoolInfoService.GetSchoolInfoAsync();
            if (listStudent == null || listStudent.Count == 0) throw new ArgumentException("No students found in the specified class.");
            try
            {
                foreach (var student in listStudent)
                {
                    var healthCheckup = new CreateHealthCheckUp
                    {
                        StudentID = student.StudentID,
                        DateCheckUp = dateCheckUp,
                    };
                    await CreateHealthCheckupAsync(healthCheckup);
                    await _notificationService.SendHealthCheckupNotificationAsync(student, dateCheckUp);
                    var parent = await _userService.GetUserByIdAsyc(student.ParentID);
                    string message = $@"
                                    <p>Kính gửi Quý phụ huynh,</p>

                                    <p>Nhà trường xin trân trọng thông báo lịch khám sức khỏe định kỳ cho học sinh như sau:</p>

                                    <ul>
                                        <li><b>Họ và tên học sinh:</b> {student.StudentName}</li>
                                        <li><b>Lớp:</b> {student.Class}</li>
                                        <li><b>Thời gian khám:</b> {healthCheckup.DateCheckUp:HH:mm} {(healthCheckup.DateCheckUp.Hour < 12 ? "sáng" : "chiều")}, ngày <b>{healthCheckup.DateCheckUp:dd/MM/yyyy}</b></li>
                                        <li><b>Địa điểm:</b> Phòng Y tế – {schoolInfo.Name}</li>
                                    </ul>

                                    <p>Buổi khám nhằm theo dõi và đánh giá tình trạng sức khỏe định kỳ của học sinh. Kết quả sẽ được cập nhật trực tiếp trên hệ thống quản lý y tế học đường.</p>

                                    <p>Quý phụ huynh vui lòng <b>đăng nhập vào hệ thống quản lý y tế học đường</b> để <b>xác nhận hoặc từ chối</b> lịch khám cho học sinh.</p>

                                    <p>Quý phụ huynh cũng vui lòng nhắc nhở các em ăn sáng và mang theo sổ khám sức khỏe (nếu có).</p>

                                    <p>Trong trường hợp học sinh có vấn đề sức khỏe đặc biệt, xin vui lòng liên hệ với y tế nhà trường trước ngày khám.</p>

                                    <br>
                                    <p>Trân trọng,</p>
                                    <p><b>Ban Y tế Trường học</b></p>
                                    ";


                    await _emailService.SendEmailAsync(parent.Email, "Thông báo khám sức khỏe cho học sinh", message);
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error creating health checkups for class: " + ex.Message);
            }
            return true;
        }

        public async Task<bool> UpdateHealthCheckupAsync(UpdateHealthCheckUp healthCheckupUpdate, string checkerId)
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
            healthCheckUp.CheckDate = DateTime.Now;
            healthCheckUp.CheckerID = checkerId;
            healthCheckUp.Notes = healthCheckupUpdate.Notes;
            var healthProfile = await _healthProfileRepository.GetHealthProfileByStudentID(healthCheckUp.StudentID);
            if (healthProfile == null) throw new KeyNotFoundException("Không tìm thấy hồ sơ sức khỏe học sinh để cập nhật");
            healthProfile.Height = healthCheckUp.Height;
            healthProfile.Weight = healthCheckUp.Weight;
            healthProfile.VisionLeft = healthCheckUp.VisionLeft;
            healthProfile.VisionRight = healthCheckUp.VisionRight;
            healthProfile.ToothDecay = healthCheckUp.Dental;
            
            try
            {
                var student = await _studentRepository.SearchStudentProfile(healthCheckUp.StudentID);
                await _healthCheckupRepository.UpdateHealthCheckupAsync(healthCheckUp);
                await _healthProfileRepository.UpdateHealthProfile(healthProfile);
                await _healthCheckupRepository.UpdateStatus(healthCheckUp, healthCheckupUpdate.Status);
                await _notificationService.UpdateHealthCheckUpNotifycationAsync(student);
                var parent = await _userService.GetUserByIdAsyc(student.ParentID);
                string message = $@"
                                <p>Kính gửi Quý phụ huynh,</p>

                                <p>Nhà trường xin thông báo rằng học sinh <b>{student.StudentName}</b> đã được tiến hành kiểm tra sức khỏe định kỳ vào ngày <b>{healthCheckUp.CheckDate:dd/MM/yyyy}</b>.</p>

                                <p><b>Kết quả khám sức khỏe</b> bao gồm các chỉ số về chiều cao, cân nặng, thị lực, huyết áp và các dấu hiệu sức khỏe tổng quát khác.</p>

                                <p>Kết quả chi tiết đã được cập nhật trên hệ thống quản lý sức khỏe học đường. Quý phụ huynh có thể đăng nhập để theo dõi tình trạng sức khỏe của học sinh.</p>

                                <p style='color: red;'><i>Lưu ý:</i> Trong trường hợp cần theo dõi đặc biệt, nhà trường sẽ liên hệ trực tiếp với quý vị.</p>

                                <br>
                                <p>Trân trọng,</p>
                                <p><b>Ban Y tế Trường học</b></p>
                                ";

                await _emailService.SendEmailAsync(parent.Email, "Thông báo kết quả khám sức khỏe học sinh", message);
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
        public async Task<GetHealthCheckup> GetHealthCheckupByIdAsync(string id)
        {
            List<GetHealthCheckup> listHealthCheckUps = new List<GetHealthCheckup>();
            var healthCheck = await _healthCheckupRepository.GetHealthCheckUpByIdAsync(id);
            if (healthCheck == null)
            {
                throw new KeyNotFoundException("Không tìm thấy hồ sơ sức khỏe cho năm này.");
            }
            var student = await _studentRepository.GetStudentProfileByStudentId(healthCheck.StudentID);
            var getHealthCheck = new GetHealthCheckup
            {
                HealthCheckUpID = healthCheck.HealthCheckUpID,
                CheckDate = healthCheck.CheckDate,
                ClassID = student.Class,
                StudentID = student.StudentID,
                StudentName = student.StudentName,
                Height = healthCheck.Height,
                Weight = healthCheck.Weight,
                BMI = healthCheck.BMI,
                VisionLeft = healthCheck.VisionLeft,
                VisionRight = healthCheck.VisionRight,
                BloodPressure = healthCheck.BloodPressure,
                Dental = healthCheck.Dental,
                Skin = healthCheck.Skin,
                Hearing = healthCheck.Hearing,
                Respiration = healthCheck.Respiration,
                Ardiovascular = healthCheck.Ardiovascular,
                Notes = healthCheck.Notes,
                Status = healthCheck.Status,
                CheckerID = healthCheck.CheckerID,
                ParentID = healthCheck.ParentID
            };

            return getHealthCheck;
        }
        public async Task<List<GetHealthCheckup>> GetAllHealthCheckupsAsync()
        {
            List<GetHealthCheckup> listHealthCheckUps = new List<GetHealthCheckup>();
            var listHealthCheckUp = await _healthCheckupRepository.GetAllHealthCheckupsAsync();
            if (listHealthCheckUp == null)
            {
                throw new KeyNotFoundException("Không tìm thấy hồ sơ sức khỏe cho năm này.");
            }
            foreach (var healthCheck in listHealthCheckUp)
            {
                var student = await _studentRepository.GetStudentProfileByStudentId(healthCheck.StudentID);
                if (student == null)
                {
                    throw new KeyNotFoundException("Không tìm thấy học sinh dựa trên thông tin đã cung cấp.");
                }
                listHealthCheckUps.Add(new GetHealthCheckup
                {
                    HealthCheckUpID = healthCheck.HealthCheckUpID,
                    CheckDate = healthCheck.CheckDate,
                    ClassID = student.Class,
                    StudentID = student.StudentID,
                    StudentName = student.StudentName,
                    Height = healthCheck.Height,
                    Weight = healthCheck.Weight,
                    BMI = healthCheck.BMI,
                    VisionLeft = healthCheck.VisionLeft,
                    VisionRight = healthCheck.VisionRight,
                    BloodPressure = healthCheck.BloodPressure,
                    Dental = healthCheck.Dental,
                    Skin = healthCheck.Skin,
                    Hearing = healthCheck.Hearing,
                    Respiration = healthCheck.Respiration,
                    Ardiovascular = healthCheck.Ardiovascular,
                    Notes = healthCheck.Notes,
                    Status = healthCheck.Status,
                    CheckerID = healthCheck.CheckerID,
                    ParentID = healthCheck.ParentID
                });
            }
            return listHealthCheckUps;
        }
        public async Task<List<HealthCheckUp>> GetHealthCheckupsByParentIdAsync(string parentId)
        {
            var students = await _studentRepository.GetStudentProfileByParentId(parentId);

            if (students == null)
                throw new KeyNotFoundException("Không tìm thấy học sinh cho phụ huynh này.");

            var result = new List<HealthCheckUp>();

            foreach (var student in students)
            {
                var checkups = await _healthCheckupRepository.GetHealthCheckupsByStudentIdAsync(student.StudentID);
                if (checkups != null && checkups.Count > 0)
                    result.AddRange(checkups);
            }

            return result;
        }
        public async Task<List<GetHealthCheckup>> GetHealthCheckupsByYearAsync(int year)
        {
            List<GetHealthCheckup> listHealthCheckUps = new List<GetHealthCheckup>();
            var listHealthCheckUp = await _healthCheckupRepository.GetHealthCheckupsByYearAsync(year);
            if (listHealthCheckUp == null)
            {
                throw new KeyNotFoundException("Không tìm thấy hồ sơ sức khỏe cho năm này.");
            }
            foreach (var healthCheck in listHealthCheckUp)
            {
                var student = await _studentRepository.GetStudentProfileByStudentId(healthCheck.StudentID);
                if (student == null)
                {
                    throw new KeyNotFoundException("Không tìm thấy học sinh dựa trên thông tin đã cung cấp.");
                }
                listHealthCheckUps.Add(new GetHealthCheckup
                {
                    HealthCheckUpID = healthCheck.HealthCheckUpID,
                    CheckDate = healthCheck.CheckDate,
                    ClassID = student.Class,
                    StudentID = student.StudentID,
                    StudentName = student.StudentName,
                    Height = healthCheck.Height,
                    Weight = healthCheck.Weight,
                    BMI = healthCheck.BMI,
                    VisionLeft = healthCheck.VisionLeft,
                    VisionRight = healthCheck.VisionRight,
                    BloodPressure = healthCheck.BloodPressure,
                    Dental = healthCheck.Dental,
                    Skin = healthCheck.Skin,
                    Hearing = healthCheck.Hearing,
                    Respiration = healthCheck.Respiration,
                    Ardiovascular = healthCheck.Ardiovascular,
                    Notes = healthCheck.Notes,
                    Status = healthCheck.Status,
                    CheckerID = healthCheck.CheckerID,
                    ParentID = healthCheck.ParentID
                });
            }
            return listHealthCheckUps;
        }
        public async Task<List<GetHealthCheckup>> GetHealthCheckUpsDeniedAsync()
        {
            List<GetHealthCheckup> listHealthCheckUps = new List<GetHealthCheckup>();
            var listHealthCheckUp = await _healthCheckupRepository.GetHealthCheckUpsDeniedAsync();
            if (listHealthCheckUp == null)
            {
                throw new KeyNotFoundException("Không tìm thấy hồ sơ sức khỏe cho năm này.");
            }
            foreach (var healthCheck in listHealthCheckUp)
            {
                var student = await _studentRepository.GetStudentProfileByStudentId(healthCheck.StudentID);
                if (student == null)
                {
                    throw new KeyNotFoundException("Không tìm thấy học sinh dựa trên thông tin đã cung cấp.");
                }
                listHealthCheckUps.Add(new GetHealthCheckup
                {
                    HealthCheckUpID = healthCheck.HealthCheckUpID,
                    CheckDate = healthCheck.CheckDate,
                    ClassID = student.Class,
                    StudentID = student.StudentID,
                    StudentName = student.StudentName,
                    Height = healthCheck.Height,
                    Weight = healthCheck.Weight,
                    BMI = healthCheck.BMI,
                    VisionLeft = healthCheck.VisionLeft,
                    VisionRight = healthCheck.VisionRight,
                    BloodPressure = healthCheck.BloodPressure,
                    Dental = healthCheck.Dental,
                    Skin = healthCheck.Skin,
                    Hearing = healthCheck.Hearing,
                    Respiration = healthCheck.Respiration,
                    Ardiovascular = healthCheck.Ardiovascular,
                    Notes = healthCheck.Notes,
                    Status = healthCheck.Status,
                    CheckerID = healthCheck.CheckerID,
                    ParentID = healthCheck.ParentID
                });
            }
            return listHealthCheckUps;
        }
        public async Task<List<GetHealthCheckup>> GetHealthCheckUpsConfirmAsync()
        {
            List<GetHealthCheckup> listHealthCheckUps = new List<GetHealthCheckup>();
            var listHealthCheckUp = await _healthCheckupRepository.GetHealthCheckUpsConfirmAsync();
            if (listHealthCheckUp == null)
            {
                throw new KeyNotFoundException("Không tìm thấy hồ sơ sức khỏe cho năm này.");
            }
            foreach (var healthCheck in listHealthCheckUp)
            {
                var student = await _studentRepository.GetStudentProfileByStudentId(healthCheck.StudentID);
                if (student == null)
                {
                    throw new KeyNotFoundException("Không tìm thấy học sinh dựa trên thông tin đã cung cấp.");
                }
                listHealthCheckUps.Add(new GetHealthCheckup
                {
                    HealthCheckUpID = healthCheck.HealthCheckUpID,
                    CheckDate = healthCheck.CheckDate,
                    ClassID = student.Class,
                    StudentID = student.StudentID,
                    StudentName = student.StudentName,
                    Height = healthCheck.Height,
                    Weight = healthCheck.Weight,
                    BMI = healthCheck.BMI,
                    VisionLeft = healthCheck.VisionLeft,
                    VisionRight = healthCheck.VisionRight,
                    BloodPressure = healthCheck.BloodPressure,
                    Dental = healthCheck.Dental,
                    Skin = healthCheck.Skin,
                    Hearing = healthCheck.Hearing,
                    Respiration = healthCheck.Respiration,
                    Ardiovascular = healthCheck.Ardiovascular,
                    Notes = healthCheck.Notes,
                    Status = healthCheck.Status,
                    CheckerID = healthCheck.CheckerID,
                    ParentID = healthCheck.ParentID
                });
            }
            return listHealthCheckUps;
        }
        public async Task<List<GetHealthCheckup>> GetHealthCheckUpsNotResponseAsync()
        {
            List<GetHealthCheckup> listHealthCheckUps = new List<GetHealthCheckup>();
            var listHealthCheckUp = await _healthCheckupRepository.GetHealthCheckUpsNotResponseAsync();
            if (listHealthCheckUp == null)
            {
                throw new KeyNotFoundException("Không tìm thấy hồ sơ sức khỏe cho năm này.");
            }
            foreach (var healthCheck in listHealthCheckUp)
            {
                var student = await _studentRepository.GetStudentProfileByStudentId(healthCheck.StudentID);
                if (student == null)
                {
                    throw new KeyNotFoundException("Không tìm thấy học sinh dựa trên thông tin đã cung cấp.");
                }
                listHealthCheckUps.Add(new GetHealthCheckup
                {
                    HealthCheckUpID = healthCheck.HealthCheckUpID,
                    CheckDate = healthCheck.CheckDate,
                    ClassID = student.Class,
                    StudentID = student.StudentID,
                    StudentName = student.StudentName,
                    Height = healthCheck.Height,
                    Weight = healthCheck.Weight,
                    BMI = healthCheck.BMI,
                    VisionLeft = healthCheck.VisionLeft,
                    VisionRight = healthCheck.VisionRight,
                    BloodPressure = healthCheck.BloodPressure,
                    Dental = healthCheck.Dental,
                    Skin = healthCheck.Skin,
                    Hearing = healthCheck.Hearing,
                    Respiration = healthCheck.Respiration,
                    Ardiovascular = healthCheck.Ardiovascular,
                    Notes = healthCheck.Notes,
                    Status = healthCheck.Status,
                    CheckerID = healthCheck.CheckerID,
                    ParentID = healthCheck.ParentID
                });
            }
            return listHealthCheckUps;
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

        public async Task<bool> WaitingHealthCheckUp(string id)
        {
            var healthCheckUp = await _healthCheckupRepository.GetHealthCheckupByIdAsync(id);
            return await _healthCheckupRepository.UpdateStatus(healthCheckUp, "Chờ khám");
        }

        public async Task<List<GetHealthCheckup>> GetHealthCheckupsByStudentIdAsync(string studentId)
        {
            List<GetHealthCheckup> listHealthCheckUps = new List<GetHealthCheckup>();
            var healthCheckups = await _healthCheckupRepository.GetHealthCheckupsByStudentIdAsync(studentId);
            if (healthCheckups == null)
            {
                throw new KeyNotFoundException("Không tìm thấy hồ sơ sức khỏe cho học sinh này.");
            }
            foreach (var healthCheck in healthCheckups)
            {
                var student = await _studentRepository.GetStudentProfileByStudentId(healthCheck.StudentID);
                if (student == null)
                {
                    throw new KeyNotFoundException("Không tìm thấy học sinh dựa trên thông tin đã cung cấp.");
                }
                listHealthCheckUps.Add(new GetHealthCheckup
                {
                    HealthCheckUpID = healthCheck.HealthCheckUpID,
                    CheckDate = healthCheck.CheckDate,
                    ClassID = student.Class,
                    StudentID = student.StudentID,
                    StudentName = student.StudentName,
                    Height = healthCheck.Height,
                    Weight = healthCheck.Weight,
                    BMI = healthCheck.BMI,
                    VisionLeft = healthCheck.VisionLeft,
                    VisionRight = healthCheck.VisionRight,
                    BloodPressure = healthCheck.BloodPressure,
                    Dental = healthCheck.Dental,
                    Skin = healthCheck.Skin,
                    Hearing = healthCheck.Hearing,
                    Respiration = healthCheck.Respiration,
                    Ardiovascular = healthCheck.Ardiovascular,
                    Notes = healthCheck.Notes,
                    Status = healthCheck.Status,
                    CheckerID = healthCheck.CheckerID,
                    ParentID = healthCheck.ParentID
                });
            }
            return listHealthCheckUps;
        }

        public async Task<int> CountHealthCheckUpByDate(DateTime fromDate, DateTime toDate)
        {
            var result = await _healthCheckupRepository.CountHealthCheckUpsAsync(fromDate, toDate);
            return result;
        }
        public async Task<int> CountConfirmHealthCheckUpByDate(DateTime fromDate, DateTime toDate)
        {
            var result = await _healthCheckupRepository.CountConfirmHealthCheckUpsAsync(fromDate, toDate);
            return result;
        }
        public async Task<int> CountDeniedHealthCheckUpByDate(DateTime fromDate, DateTime toDate)
        {
            var result = await _healthCheckupRepository.CountDeninedHealthCheckUpsAsync(fromDate, toDate);
            return result;
        }
        public async Task<int> CountNotResponseHealthCheckUpByDate(DateTime fromDate, DateTime toDate)
        {
            var result = await _healthCheckupRepository.CountNotResponseHealthCheckUpsAsync(fromDate, toDate);
            return result;
        }
    }
}
