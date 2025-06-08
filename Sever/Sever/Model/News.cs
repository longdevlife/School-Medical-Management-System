using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class News
    {
        [Key]
        public int NewsID { get; set; }
        public string Title { get; set; }
        public DateTime DateTime { get; set; }
        public string Summary { get; set; }
        public string Author { get; set; }
        public string Body { get; set; }
        public byte Status { get; set; }
        public string UserID { get; set; }
        [ForeignKey("UserID")]
        public User User { get; set; }
        public List<Files> File { get; set; }
    }
}
