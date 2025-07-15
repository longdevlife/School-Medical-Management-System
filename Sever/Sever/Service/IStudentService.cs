using Sever.DTO.Student;
using Sever.Model;
using Sever.Repository;
using System.Threading.Tasks;

namespace Sever.Service
{
    public interface IStudentService
    {
        Task<GetStudentInfoRequest> SearchStudentProfileAsync(string info);
        Task<List<GetStudentInfoRequest>> GetAllStudentInfo();
        Task<List<GetStudentInfoRequest>> GetStudentProfilesByParentAsync(string parent);
        Task<bool> CreateStudent(CreateStudentRequest createStudentRequests);
        Task<bool> DeleteStudentProfile(string studentId);
        Task<bool> UpdateStudentProfile(UpdateStudentRequest updateStudentRequest);
    }

    public class StudentService : IStudentService
    {
        private readonly IStudentProfileRepository _studentProfileRepository;
        private readonly IUserRepository _userRepository;
        private readonly IHealthProfileRepository _healthProfileRepository;
        private readonly IFilesService _filesService;
        public StudentService(IStudentProfileRepository studentProfileRepository,
                            IUserRepository userRepository,
                            IHealthProfileRepository healthProfileRepository,
                            IFilesService filesService)
        {
            _studentProfileRepository = studentProfileRepository;
            _userRepository = userRepository;
            _healthProfileRepository = healthProfileRepository;
            _filesService = filesService;
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
                    Class = studentProfile.Class,
                    Avatar = studentProfile.StudentAvata,
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

        public async Task<List<GetStudentInfoRequest>> GetStudentProfilesByParentAsync(string parentID)
        {
            List<GetStudentInfoRequest> studentInfoList = new List<GetStudentInfoRequest>();
            try
            {
                var studentProfiles = await _studentProfileRepository.GetStudentProfileByParentId(parentID);

                if (studentProfiles != null) return null;


                foreach (var student in studentProfiles)
                {
                    studentInfoList.Add(new GetStudentInfoRequest
                    {
                        StudentID = student.StudentID,
                        StudentName = student.StudentName,
                        Class = student.Class,
                        Avatar = student.StudentAvata,
                        Birthday = student.Birthday,
                        Ethnicity = student.Ethnicity,
                        Location = student.Location,
                        ParentName = student.Parent.Name,
                        RelationName = student.RelationName,
                        ParentEmail = student.Parent.Email,
                        Nationality = student.Nationality,
                        Sex = student.Sex,
                        ParentPhone = student.Parent.Phone,
                    });
                }
                return studentInfoList;
            }
            catch
            {
                throw new Exception("Lỗi khi lấy thông tin học sinh theo phụ huynh");
            }
        }

        public async Task<bool> CreateStudent(CreateStudentRequest createStudentRequests)
        {
            var parent = await _userRepository.GetUserByUsernameAsync(createStudentRequests.parentUserName);
            if (parent == null)
            {
                throw new KeyNotFoundException("Phụ huynh không tồn tại");
            }
            var student = new StudentProfile
            {
                StudentID = await _studentProfileRepository.NextId(),
                StudentName = createStudentRequests.StudentName,
                Class = createStudentRequests.Class,
                RelationName = createStudentRequests.RelationName,
                Nationality = createStudentRequests.Nationality,
                Ethnicity = createStudentRequests.Ethnicity,
                Birthday = createStudentRequests.Birthday,
                Sex = createStudentRequests.Sex,
                Location = createStudentRequests.Location,
                ParentID = parent.UserID,
            };
            await _studentProfileRepository.CreateStudentProfile(student);

            return await _healthProfileRepository.AddHealthProfile(new HealthProfile
            {
                HealthProfileID = await _healthProfileRepository.NewID(),
                StudentID = student.StudentID,
            });
        }
        public async Task<bool> DeleteStudentProfile(string studentId)
        {
            var studentProfile = await _studentProfileRepository.GetStudentProfileByStudentId(studentId);
            if (studentProfile == null)
            {
                throw new KeyNotFoundException("Học sinh không tồn tại");
            }
            return await _studentProfileRepository.DeleteStudentProfile(studentProfile);
        }

        public async Task<bool> UpdateStudentProfile(UpdateStudentRequest updateStudentRequest)
        {
            var studentProfile = await _studentProfileRepository.GetStudentProfileByStudentId(updateStudentRequest.StudentID);
            if (studentProfile == null)
            {
                throw new KeyNotFoundException("Học sinh không tồn tại");
            }
            if (updateStudentRequest.StudentName != null)
            {
                studentProfile.StudentName = updateStudentRequest.StudentName;
            }
            if (updateStudentRequest.Class != null)
            {
                studentProfile.Class = updateStudentRequest.Class;
            }
            if (updateStudentRequest.RelationName != null)
            {
                studentProfile.RelationName = updateStudentRequest.RelationName;
            }
            if (updateStudentRequest.Nationality != null)
            {
                studentProfile.Nationality = updateStudentRequest.Nationality;
            }
            if (updateStudentRequest.Ethnicity != null)
            {
                studentProfile.Ethnicity = updateStudentRequest.Ethnicity;
            }
            if (updateStudentRequest.Birthday != null)
            {
                studentProfile.Birthday = updateStudentRequest.Birthday;
            }
            if (updateStudentRequest.Sex != null)
            {
                studentProfile.Sex = updateStudentRequest.Sex;
            }
            if (updateStudentRequest.Location != null)
            {
                studentProfile.Location = updateStudentRequest.Location;
            }
            if (updateStudentRequest.StudentAvata != null)
            {
                var avata = await _filesService.UploadStudentAvataAsync(updateStudentRequest.StudentAvata, studentProfile.StudentID);
                studentProfile.StudentAvata = avata.Url;
            }
            var result = await _studentProfileRepository.UpdateStudentProfile(studentProfile);
            return result;
        }

        public async Task<List<GetStudentInfoRequest>> GetAllStudentInfo()
        {
            var results = await _studentProfileRepository.GetAllStudent();
            List<GetStudentInfoRequest> getStudents = new List<GetStudentInfoRequest>();
            foreach (var student in results)
            {
                getStudents.Add(new GetStudentInfoRequest
                {
                    StudentID = student.StudentID,
                    StudentName = student.StudentName,
                    Avatar = student.StudentAvata,
                    Class = student.Class,
                    Nationality = student.Nationality,
                    Ethnicity = student.Ethnicity,
                    Birthday = student.Birthday,
                    Sex = student.Sex,
                    Location = student.Location,
                    ParentName = student.Parent.Name,
                    RelationName = student.RelationName,
                    ParentEmail = student.Parent.Email,
                    ParentPhone = student.Parent.Phone,
                });
            }
            return getStudents;
        }
    }
}
