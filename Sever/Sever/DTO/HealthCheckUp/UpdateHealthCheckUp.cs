namespace Sever.DTO.HealthCheckUp
{
    public class UpdateHealthCheckUp
    {
        public string HealthCheckId { get; set; }
        public float? Height { get; set; }
        public float? Weight { get; set; }
        public float? BMI { get; set; }
        public int? VisionLeft { get; set; }
        public int? VisionRight { get; set; }
        public float? BloodPressure { get; set; }
        public string? Dental { get; set; }
        public string? Skin { get; set; }
        public string? Hearing { get; set; }
        public string? Respiration { get; set; }
        public string? Ardiovascular { get; set; }
        public string? Notes { get; set; }
    }
}
