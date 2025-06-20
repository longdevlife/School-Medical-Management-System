using Sever.DTO.Student;
using Sever.Repository;

namespace Sever.Service
{
    public interface IStudentService
    {
        Task<GetStudentInfoRequest> SearchStudentProfileAsync(string info);
    }

    public class StudentService : IStudentService
    {
        private readonly IStudentProfileRepository _studentProfileRepository;
        public StudentService(IStudentProfileRepository studentProfileRepository)
        {
            _studentProfileRepository = studentProfileRepository;
        }
        public async Task<GetStudentInfoRequest> SearchStudentProfileAsync(string info)
        {
            try
            {
                var studentProfile = await _studentProfileRepository.SearchStudentProfile(info);
                return new GetStudentInfoRequest
                {
                    StudentID = studentProfile.StudentID,
                    StudentName = studentProfile.StudentName,
                    Nationality = studentProfile.Nationality,
                    Ethnicity = studentProfile.Ethnicity,
                    Birthday = studentProfile.Birthday,
                    Sex = studentProfile.Sex,
                    Location = studentProfile.Location,
                    ParentName = studentProfile.Parent.Name,
                    RelationName = studentProfile.RelationName,
                    ParentEmail = studentProfile.Parent.Email,
                    ParentPhone = studentProfile.Parent.Phone

                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm kiếm thông tin học sinh: {ex.Message}");
            }
        }




    }
}
