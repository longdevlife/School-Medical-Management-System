using Sever.Context;
using Sever.DTO.HealProfile;
using Sever.DTO.HealthProfile;
using Sever.Model;
using Sever.Repository;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Sever.Service
{
    /* Parent: 
        1. Declare/Update Health Profile for their Student'ID + Notify to Nurse
        2. Health Profile of their Student'ID + Notify to Nurse

     * Nurse:
        1. Get Health Profile of Student'ID
        2. Update Health Profile of Student'ID (vertify) + Notify to Parent
        4. Get Health Profile List

    Report or dashboard 
        1. Get Health Profile List of Student'ID
        2. Get Health Profile List of Class'ID
        3. Get Health Profile List of School'ID
        4. Get Health Profile List of disease-list
    */
    public interface IHealthProfileService
    {
        Task<HealthProfile> GetHealthProfileByStudentIdAsync(string studentId);
        Task<List<HealthProfileResponse>> GetHealthProfileByParentIdAsync(string parentName);
        Task<List<HealthProfileResponse>> GetAllHealthProfilesAsync();

        Task<bool> DelareHealthProfileAsync(DeclareHealthProfile declareHealthProfile);
        Task<bool> UpdateHealthProfileAsync(UpdateHealthProfile update, string userName);
    }

    public class HealthProfileService : IHealthProfileService
    {
        private readonly IHealthProfileRepository _healthProfileRepository;
        private readonly INotificationService _notificationService;
        private readonly IStudentProfileRepository _studentProfileRepository;
        private readonly IUserService _userService;

        public HealthProfileService(IHealthProfileRepository healthProfileRepository, INotificationService notificationService,
            IStudentProfileRepository studentProfileRepository,
            IUserService userService)
        {
            _healthProfileRepository = healthProfileRepository;
            _notificationService = notificationService;
            _studentProfileRepository = studentProfileRepository;
            _userService = userService;
        }

        public async Task<HealthProfile> GetHealthProfileByStudentIdAsync(string studentId)
        {

            var profile = await _healthProfileRepository.GetHealthProfileByStudentID(studentId);
            if (profile == null) throw new KeyNotFoundException("Không tìm thấy hồ sơ sức khỏe");
            return profile;
        }

        public async Task<bool> DelareHealthProfileAsync(DeclareHealthProfile declareHealthProfile)
        {
            if (declareHealthProfile == null) throw new ArgumentNullException(nameof(declareHealthProfile), "Health Profile cannot be null");
            var healthProfile = await _healthProfileRepository.GetHealthProfileByStudentID(declareHealthProfile.StudentID);
            if (healthProfile == null) { throw new KeyNotFoundException("Health Profile not found for the given StudentID"); }

            healthProfile.Height = declareHealthProfile.Height;
            healthProfile.Weight = declareHealthProfile.Weight;
            healthProfile.AllergyHistory = declareHealthProfile.AllergyHistory;
            healthProfile.ChronicDiseases = declareHealthProfile.ChronicDiseases;
            healthProfile.PastSurgeries = declareHealthProfile.PastSurgeries;
            healthProfile.SurgicalCause = declareHealthProfile.SurgicalCause;
            healthProfile.Disabilities = declareHealthProfile.Disabilities;
            healthProfile.VisionLeft = declareHealthProfile.VisionLeft;
            healthProfile.VisionRight = declareHealthProfile.VisionRight;
            healthProfile.ToothDecay = declareHealthProfile.ToothDecay;
            healthProfile.OtheHealthIssues = declareHealthProfile.OtheHealthIssues;
            var result = await _healthProfileRepository.UpdateHealthProfile(healthProfile);
            if (result)
            {
                await _notificationService.HealthProfileNotificationForAllNurses(declareHealthProfile.StudentID);
            }
            return result;
        }

        public async Task<bool> UpdateHealthProfileAsync(UpdateHealthProfile update, string userName)
        {
            var nurse = await _userService.GetUserAsyc(userName);
            if (nurse == null) throw new Exception("Không tìm thấy tài khoản y tá.");

            var profile = await _healthProfileRepository.GetHealthProfileByStudentID(update.StudentID);
            if (profile == null) throw new KeyNotFoundException("Không tìm thấy hồ sơ sức khỏe.");

            if (!string.IsNullOrWhiteSpace(update.AllergyHistory))
                profile.AllergyHistory = update.AllergyHistory;

            if (!string.IsNullOrWhiteSpace(update.ChronicDiseases))
                profile.ChronicDiseases = update.ChronicDiseases;

            if (update.PastSurgeries.HasValue)
                profile.PastSurgeries = update.PastSurgeries;

            if (!string.IsNullOrWhiteSpace(update.SurgicalCause))
                profile.SurgicalCause = update.SurgicalCause;

            if (!string.IsNullOrWhiteSpace(update.Disabilities))
                profile.Disabilities = update.Disabilities;

            if (update.Height.HasValue)
                profile.Height = update.Height;

            if (update.Weight.HasValue)
                profile.Weight = update.Weight;

            if (update.VisionLeft.HasValue)
                profile.VisionLeft = update.VisionLeft;

            if (update.VisionRight.HasValue)
                profile.VisionRight = update.VisionRight;

            if (!string.IsNullOrWhiteSpace(update.ToothDecay))
                profile.ToothDecay = update.ToothDecay;

            if (!string.IsNullOrWhiteSpace(update.OtheHealthIssues))
                profile.OtheHealthIssues = update.OtheHealthIssues;

            var result = await _healthProfileRepository.UpdateHealthProfile(profile);
            if (result)
            {
                await _notificationService.HealthProfileNotificationForParent(update.StudentID,
                    $"Y tá {nurse.Name} đã cập nhật hồ sơ sức khỏe của học sinh.");
            }

            return result;
        }

        public async Task<List<HealthProfileResponse>> GetAllHealthProfilesAsync()
        {
            var healthProfiles = await _healthProfileRepository.GetAllAsync();

            var response = new List<HealthProfileResponse>();
            foreach (var hp in healthProfiles)
            {
                response.Add(new HealthProfileResponse
                {
                    HealthProfileID = hp.HealthProfileID,
                    StudentID = hp.StudentID,
                    StudentName = hp.StudentProfile?.StudentName, 
                    Class = hp.StudentProfile?.Class,
                    AllergyHistory = hp.AllergyHistory,
                    ChronicDiseases = hp.ChronicDiseases,
                    PastSurgeries = hp.PastSurgeries,
                    SurgicalCause = hp.SurgicalCause,
                    Disabilities = hp.Disabilities,
                    Height = hp.Height,
                    Weight = hp.Weight,
                    VisionLeft = hp.VisionLeft,
                    VisionRight = hp.VisionRight,
                    ToothDecay = hp.ToothDecay,
                    OtheHealthIssues = hp.OtheHealthIssues

                });
            }

            return response;
        }

        public async Task<List<HealthProfileResponse>> GetHealthProfileByParentIdAsync(string parentName)
        {
            var parent = await _userService.GetUserAsyc(parentName);
            if (parent == null) return null;

            var userId = parent.UserID;

            var students = await _studentProfileRepository.GetStudentProfileByParentId(userId);
            if (students == null || !students.Any()) return null;

            var result = new List<HealthProfileResponse>();

            foreach (var student in students)
            {
                var profile = await _healthProfileRepository.GetHealthProfileByStudentID(student.StudentID);
                if (profile != null)
                {
                    result.Add(new HealthProfileResponse
                    {
                        StudentID = student.StudentID,
                        StudentName = student.StudentName,
                        Class = student.Class,
                        HealthProfileID = profile.HealthProfileID,
                        AllergyHistory = profile.AllergyHistory,
                        ChronicDiseases = profile.ChronicDiseases,
                        PastSurgeries = profile.PastSurgeries,
                        SurgicalCause = profile.SurgicalCause,
                        Disabilities = profile.Disabilities,
                        Height = profile.Height,
                        Weight = profile.Weight,
                        VisionLeft = profile.VisionLeft,
                        VisionRight = profile.VisionRight,
                        ToothDecay = profile.ToothDecay,
                        OtheHealthIssues = profile.OtheHealthIssues
                    });
                }
            }

            return result;
        }
    }
}

