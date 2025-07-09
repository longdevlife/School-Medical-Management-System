using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class StudentProfile
    {
        [Key]
        public string StudentID { get; set; }
        public string StudentName { get; set; }
        public string Class { get; set; }
        public string? StudentAvata { get; set; }
        public string RelationName { get; set; }
        public string Nationality { get; set; }
        public string Ethnicity { get; set; }
        public DateTime? Birthday { get; set; }
        public string Sex { get; set; }
        public string Location { get; set; }
        public string ParentID { get; set; }
        [ForeignKey("ParentID")]
        public User Parent { get; set; }
        public List<HealthProfile> HealthProfiles { get; set; } 
        public List<VaccinationRecord> VaccinationRecord { get; set; }
        public List<HealthCheckUp> HealthCheckUp { get; set; }
        public List<MedicalEventDetail> MedicalEventDetail { get; set; }

    }

}
