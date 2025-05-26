using System.ComponentModel.DataAnnotations;

namespace Sever.Model
{
    public class ConfigSystem
    {
        [Key]
        public string ConfigID { get; set; }
        public string value { get; set; }
        public string? Description { get; set; }
        public DateTime DateTimeUpdate { get; set; }
    }
}
