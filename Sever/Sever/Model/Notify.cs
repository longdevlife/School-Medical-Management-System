using System.ComponentModel.DataAnnotations;

namespace Sever.Model
{
    public class Notify
    {
        [Required]
        public string NotifyID { get; set; }
        public string? FormID {  get; set; }
        public Form Form { get; set; }
        public string? UserID { get; set; }
        public User User { get; set; }
        [Required]
        public string NotifyName { get; set; }
        public DateTime DateTime { get; set; } = DateTime.Now;
        public string? Title { get; set; }
        public string? Description { get; set; }
        
    }
}