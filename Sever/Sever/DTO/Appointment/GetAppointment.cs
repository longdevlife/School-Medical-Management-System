namespace Sever.DTO.Appointment
{
    public class GetAppointment
    {
        public string AppointmentID { get; set; }
        public string StudentName { get; set; }
        public string ClasseName { get; set; }
        public DateTime DateTime { get; set; }
        public string Location { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public string? Notes { get; set; }
        public string HealthCheckUpID { get; set; }
    }
}
