namespace Sever.DTO.User
{
    public class GetUser
    {
        public string UserID { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public bool IsActive { get; set; }
        public string RoleName { get; set; }
    }
}
