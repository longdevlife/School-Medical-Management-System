using Sever.Context;
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

            // Các phương thức khác có thể triển khai tương tự...
        }

    }

