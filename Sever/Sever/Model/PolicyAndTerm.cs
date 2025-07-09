using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class PolicyAndTerm
    {
        [Key]
        public int Id { get; set; }
        public string titile { get; set; }
        public string Description { get; set; }
        public string SchoolID { get; set; }
        [ForeignKey("SchoolID")]
        public SchoolInfo SchoolInfo{ get; set; }
    }
}
