using System.ComponentModel.DataAnnotations;

namespace Sever.Model
{
    public class Role
    {
        [Key]
        public string RoleID { get; set; }
        public string RoleName { get; set; }
        public List<User> Users { get; set; }
    }
}
