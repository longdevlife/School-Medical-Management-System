using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class Appointment
    {
        public string AppointmentID { get; set; }
        public DateTime DateTime { get; set; }
        public string Location { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public string? Notes { get; set; }
        public string MedicalSpecilistID { get; set; }
        [ForeignKey("MedicalSpecilistID")]
        public User MedicalSpecilist {  get; set; }
        public string StudentID { get; set; }
        [ForeignKey("StudentID")]
        public StudentProfile StudentProfile { get; set; }
        public string ParentID { get; set; }
        [ForeignKey("ParentID")]
        public User Parent { get; set; }
        public string HealthCheckUpID { get; set; }
        [ForeignKey("HealthCheckUpID")]
        public HealthCheckUp HealthCheckUp { get; set; }
    }
}
