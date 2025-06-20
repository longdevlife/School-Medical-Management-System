using System.ComponentModel.DataAnnotations;

namespace Sever.Model
{
    public class SchoolInfo
    {
        [Key]
        public string SchoolID { get; set; }
        public string Logo { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Hotline { get; set; }
        public string Email { get; set; }
        public List<PolicyAndTerm> PolicyAndTerm { get; set; }
    }
}
