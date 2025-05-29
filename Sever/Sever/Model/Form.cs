using System.ComponentModel.DataAnnotations;

namespace Sever.Model
{
    public class Form
    {
        [Key]
        public string FormID { get; set; }
        public string FormName { get; set; }
        public string Link { get; set; }
        public string? Description { get; set; }
        public List<Notify> Notify { get; set; }
    }
}