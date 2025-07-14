namespace Sever.DTO.HealthCheckUp
{
    public class CreateHealthCheckUp
    {
        public string StudentID { get; set; }
        public string HealthCheckUpID { get; set; }
        public string? ClassID { get; set; }
        public DateTime DateCheckUp { get; set; }
        public string? Note { get; set; }
        
    }
}
