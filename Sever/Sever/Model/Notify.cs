using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class Notify
    {
        [Key]
        public string NotifyID { get; set; }
        public string NotifyName { get; set; }
        public DateTime? DateTime { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? UserID { get; set; }
        [ForeignKey("UserID")]
        public User User { get; set; }


    }
}