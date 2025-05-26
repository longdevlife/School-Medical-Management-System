using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class User
    {
        [Key]
        public string UserID { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public int RoleID { get; set; }
        [ForeignKey("RoleID")]
        public Role Role { get; set; }
        public List<StudentProfile> StudentProfile { get; set; }
        public List<MedicalEvent> MedicalEvent { get; set; }
        public List<VaccinationRecord> VaccinationRecord { get; set; }
        public List<Medicine> Medicine { get; set; }
        public List<HealthCheckUp> HealthCheckUp { get; set; }
        public List<Appointment> MedicalAppointments { get; set; }
        public List<Appointment> ParentAppointments { get; set; }
        public List<Notify> Notify { get; set; }
    }
}
