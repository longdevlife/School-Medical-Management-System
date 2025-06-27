using Sever.Context;
using Sever.DTO.HealProfile;
using Sever.Model;
using Sever.Repository;

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
        Task<bool> DelareHealthProfileAsync(DeclareHealthProfile declareHealthProfile);
    }

    public class HealthProfileService : IHealthProfileService
    {
        private readonly IHealthProfileRepository _healthProfileRepository;

        public HealthProfileService(IHealthProfileRepository healthProfileRepository)
        {
            _healthProfileRepository = healthProfileRepository;
        }

        public async Task<HealthProfile> GetHealthProfileByStudentIdAsync(string studentId)
        {
            return await _healthProfileRepository.GetHealthProfileByStudentID(studentId);
        }

        public async Task<bool> DelareHealthProfileAsync(DeclareHealthProfile declareHealthProfile)
        {
            if (declareHealthProfile == null) throw new ArgumentNullException(nameof(declareHealthProfile), "Health Profile cannot be null");
            var healthProfile = await _healthProfileRepository. GetHealthProfileByStudentID(declareHealthProfile.StudentID);
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
            return await _healthProfileRepository.UpdateHealthProfile(healthProfile);
        }
    }

}

