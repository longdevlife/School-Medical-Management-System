using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class User
    {
        [Key]
        public string UserID { get; set; }
        [Required]
        public string UserName { get; set; }
        [Required]
        public string Password { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string RoleID { get; set; }
        [ForeignKey("RoleID")]
        public Role Role { get; set; }
        public List<StudentProfile> StudentProfile { get; set; }
        public List<MedicalEvent> MedicalEvent { get; set; }
        public List<VaccinationRecord> VaccinationRecord { get; set; }
        public List<Medicine> Medicine { get; set; }
        public List<HealthCheckUp> NurseHealthCheckUp { get; set; }
        public List<Notify> Notify { get; set; }
        public List<HealthCheckUp> ParentHealthCheckUp { get; set; }
        public List<Vaccine> Vaccine { get; set; }
        public List<News> News { get; set; }
    }
}
