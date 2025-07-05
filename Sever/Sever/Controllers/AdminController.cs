using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Sever.DTO.SchoolInfo;
using Sever.DTO.Student;
using Sever.DTO.User;
using Sever.Service;
using System.Security.Claims;

namespace Sever.Controllers
{
    [Authorize(Roles = "4")]
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IFilesService _filesService;
        private readonly ISchoolInfoService _schoolInfoService;
        private readonly IStudentService _studentService;
        public AdminController(IUserService userService,
                               IFilesService filesService,
                               ISchoolInfoService schoolInfoService,
                               IStudentService studentService)
        {
            _userService = userService;
            _filesService = filesService;
            _schoolInfoService = schoolInfoService;
            _studentService = studentService;
        }

        [HttpPost("create-accounts")]
        public async Task<IActionResult> CreateAccounts(List<CreateUserRequest> users)
        {
            if (users == null || users.Count == 0)
            {
                return BadRequest(new { message = "Danh sách người dùng không được để trống" });
            }

            try
            {
                var results = new List<string>();

                foreach (var user in users)
                {
                    try
                    {
                        await _userService.CreateUserAsyc(user);
                        results.Add($"Tạo tài khoản '{user.UserName}' thành công");
                    }
                    catch
                    {
                        results.Add($"Tạo tài khoản '{user.UserName}' thất bại");
                    }
                }

                return Ok(new { messages = results });
            }
            catch
            {
                return BadRequest(new { message = "Tạo tài khoản thất bại" });
            }
        }

        [HttpPut("update-user-info")]
        public async Task<IActionResult> UpdateUserAccount(UpdateUserRequest userRequest)
        {
            if (string.IsNullOrEmpty(userRequest.UserName))
            {
                return BadRequest(new { message = "Không tìm thấy thông tin người dùng" });
            }
            try
            {
                var result = await _userService.UpdateUserAsync(userRequest, userRequest.UserName);
                if (result)
                {
                    return Ok(new { message = "Cập nhật tài khoản thành công" });
                }
                else
                {
                    return NotFound(new { message = "Không tìm thấy tài khoản để cập nhật" });
                }
            }
            catch
            {
                return BadRequest(new { message = "Cập nhật tài khoản thất bại" });
            }
        }
        [HttpDelete("delete-user")]
        public async Task<IActionResult> DeleteAccount(DeleteUserRequest username)
        {
            if (username == null)
            {
                return BadRequest(new { message = "Tên người dùng không được để trống" });
            }
            try
            {
                var result = await _userService.DeleteUserByUserNameAsync(username);
                if (result)
                {
                    return Ok(new { message = "Xóa tài khoản thành công" });
                }
                else
                {
                    return NotFound(new { message = "Không tìm thấy tài khoản để xóa" });
                }
            }
            catch
            {
                return BadRequest(new { message = "Xóa tài khoản thất bại" });
            }
        }
        [HttpPost("get-users-from-file")]
        public async Task<IActionResult> GetUsersFromFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không hợp lệ");

            var users = await _filesService.ReadUsersFromExcelAsync(file);

            return Ok(users);
        }

        [HttpPut("update-school-info")]
        public async Task<IActionResult> UpdateSchoolInfo(SchoolInfoUpdate schoolInfoRequest)
        {
            if (schoolInfoRequest == null)
            {
                return BadRequest(new { message = "Thông tin trường học không được để trống" });
            }
            try
            {
                var result = await _schoolInfoService.UpdateSchoolInfoAsync(schoolInfoRequest);
                if (result)
                {
                    return Ok(new { message = "Cập nhật thông tin trường học thành công" });
                }
                else
                {
                    return NotFound(new { message = "Không tìm thấy thông tin trường học để cập nhật" });
                }
            }
            catch
            {
                return BadRequest(new { message = "Cập nhật thông tin trường học thất bại" });
            }
        }

        [HttpGet("get-all-account")]
        public async Task<IActionResult> GetAllAccount()
        {
            try
            {
                var users = await _userService.GetAllUserAsync();
                if (users == null)
                {
                    return NotFound(new { message = "Không tìm thấy người dùng nào" });
                }
                return Ok(users);
            }
            catch
            {
                return BadRequest(new { message = "Lấy danh sách người dùng thất bại" });
            }
        }
        [HttpGet("search-user/{key}")]
        public async Task<IActionResult> SearchUser(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                return BadRequest(new { message = "Từ khóa tìm kiếm không được để trống" });
            }
            try
            {
                var users = await _userService.SearchUserAsync(key);
                if (users == null)
                {
                    return NotFound(new { message = "Không tìm thấy người dùng nào" });
                }
                return Ok(users);
            }
            catch
            {
                return BadRequest(new { message = "Tìm kiếm người dùng thất bại" });
            }
        }
        [HttpPost("get-students-from-file")]
        public async Task<IActionResult> GetStudentsFromFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không hợp lệ");

            var users = await _filesService.ReadStudentFromExcelAsync(file);

            return Ok(users);
        }

        [HttpPost("create-list-student")]
        public async Task<IActionResult> CreateListStudent(List<CreateStudentRequest> students)
        {
            if (students == null || students.Count == 0)
            {
                return BadRequest(new { message = "Danh sách học sinh không được để trống" });
            }
            try
            {
                var results = new List<string>();
                foreach (var student in students)
                {
                    try
                    {
                        await _studentService.CreateStudent(student);
                        results.Add($"Tạo học sinh '{student.StudentName}' thành công");
                    }
                    catch (Exception ex)
                    {
                        results.Add($"Tạo học sinh '{student.StudentName}' thất bại");
                        results.Add($"Tạo học sinh '{student.StudentName}' thất bại: {ex.Message}");

                    }
                }
                return Ok(new { messages = results });
            }
            catch
            {
                return BadRequest(new { message = "Tạo học sinh thất bại" });
            }
        }
        [HttpPut("active-account")]
        public async Task<IActionResult> ActivateAccount([FromBody]string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { message = "Tên người dùng không được để trống" });
            }
            try
            {
                var user = await _userService.ActivativeAccountasync(username);  
                return Ok(new { message = "Kích hoạt tài khoản thành công" });
            }
            catch
            {
                return BadRequest(new { message = "Kích hoạt tài khoản thất bại" });
            }
        }
        [HttpGet("get-student-info-by-parent")]
        public async Task<IActionResult> GetStudentInfoByParent([FromBody]string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Tên tài khoản người dùng không hợp lệ");
            }
            var parent = await _userService.GetUserAsyc(username);
            if (parent == null)
            {
                return BadRequest(new { message = "Không tìm thấy thông tin phụ huynh." });
            }

            var student = await _studentService.GetStudentProfilesByParentAsync(parent.UserID);
            if (student == null)
            {
                return NotFound(new { message = "Không tìm thấy thông tin học sinh." });
            }
            return Ok(student);

        }
        [HttpPost("create-student-profile")]
        public async Task<IActionResult> CreateStudentProfile([FromBody] CreateStudentRequest createStudentRequest)
        {
            if (createStudentRequest == null)
            {
                return BadRequest(new { message = "Thông tin học sinh không được để trống" });
            }
            try
            {
                var result = await _studentService.CreateStudent(createStudentRequest);
                if (result)
                {
                    return Ok(new { message = "Tạo hồ sơ học sinh thành công" });
                }
                else
                {
                    return BadRequest(new { message = "Tạo hồ sơ học sinh thất bại" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Tạo hồ sơ học sinh thất bại: {ex.Message}" });
            }
        }
    }
}
