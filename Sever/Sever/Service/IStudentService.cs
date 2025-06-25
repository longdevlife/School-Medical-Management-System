using Sever.DTO.Student;
using Sever.Model;
using Sever.Repository;
using System.Threading.Tasks;

namespace Sever.Service
{
    public interface IStudentService
    {
        Task<GetStudentInfoRequest> SearchStudentProfileAsync(string info);
        Task<List<GetStudentInfoRequest>> GetStudentProfilesByParentAsync(string parent);
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

        public async Task<List<GetStudentInfoRequest>> GetStudentProfilesByParentAsync(string parent)
        {
            List<GetStudentInfoRequest> studentInfoList = new List<GetStudentInfoRequest>();
            try
            {
                var studentProfiles = await _studentProfileRepository.GetStudentProfileByParentId(parent);
                foreach (var student in studentProfiles)
                {
                    studentInfoList.Add(new GetStudentInfoRequest
                    {
                        StudentID = student.StudentID,
                        StudentName = student.StudentName,
                        Birthday = student.Birthday,
                        Ethnicity = student.Ethnicity,
                        Location = student.Location,
                        ParentName = student.Parent.Name,
                        RelationName = student.RelationName,
                        ParentEmail = student.Parent.Email,
                        Nationality = student.Nationality,
                        Sex = student.Sex,
                        ParentPhone = student.Parent.Phone

                    });
                }
                return studentInfoList;
            }
            catch
            {
                throw new Exception("Lỗi khi lấy thông tin học sinh theo phụ huynh");
            }
        }
    }
}
