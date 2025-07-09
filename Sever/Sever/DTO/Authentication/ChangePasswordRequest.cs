namespace Sever.DTO.Authentication
{
    public class ChangePasswordRequest
    {
        public string oldPass {  get; set; }
        public string newPass { get; set; }
    }
}
