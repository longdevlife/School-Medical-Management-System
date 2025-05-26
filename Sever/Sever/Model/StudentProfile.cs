using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class StudentProfile
    {
        [Key]
        public string StudentID { get; set; }
        public string StudentName { get; set; }
        public string RelationName { get; set; }
        public string Nationality { get; set; }
        public string Ethnicity { get; set; }
        public DateTime Birthday { get; set; }
        public string Sex { get; set; }
        public string Location { get; set; }
        public string ParentID { get; set; }
        [ForeignKey("ParentID")]
        public User Parent { get; set; }
        public List<HealthProfile> HealthProfiles { get; set; } 
        public List<MedicalEvent> MedicalEvent { get; set; }
        public List<VaccinationRecord> VaccinationRecord { get; set; }
        public List<Medicine> Medicine {  get; set; }
        public List<HealthCheckUp> HealthCheckUp { get; set; }
        public List<Appointment> Appointment { get; set; }
    }

}
