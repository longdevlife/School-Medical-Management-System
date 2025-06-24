namespace Sever.DTO.Appointment
{
    public class CreateAppointment
    {
        public string AppointmentID { get; set; }
        public DateTime DateTime { get; set; }
        public string Location { get; set; }
        public string Reason { get; set; }
        public string? Notes { get; set; }
        public string HealthCheckUpID { get; set; }
    }
}
