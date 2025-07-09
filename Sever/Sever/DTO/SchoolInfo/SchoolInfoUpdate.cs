namespace Sever.DTO.SchoolInfo
{
    public class SchoolInfoUpdate
    {
        public string SchoolID { get; set; }
        public IFormFile Logo { get; set; }
        public IFormFile LogoGifs { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Hotline { get; set; }
        public string Email { get; set; }
    }
}