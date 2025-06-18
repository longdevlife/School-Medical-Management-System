using System.ComponentModel.DataAnnotations;

namespace Sever.DTO.User
{
    public class CreateUserRequest
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string RoleID { get; set; }
    }
}
