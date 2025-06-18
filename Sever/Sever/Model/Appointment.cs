using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class Appointment
    {
        [Key]
        public string AppointmentID { get; set; }
        public DateTime DateTime { get; set; }
        public string Location { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public string? Notes { get; set; }
        public string HealthCheckUpID { get; set; }
        [ForeignKey("HealthCheckUpID")]
        public HealthCheckUp HealthCheckUp { get; set; }
    }
}
