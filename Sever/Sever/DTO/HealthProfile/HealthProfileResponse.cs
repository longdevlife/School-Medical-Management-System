namespace Sever.DTO.HealthProfile
{
    public class HealthProfileResponse
    {
        public string StudentID { get; set; }
        public string StudentName { get; set; }
        public string Class { get; set; }
        public string? HealthProfileID { get; set; }
        public string? AllergyHistory { get; set; }
        public string? ChronicDiseases { get; set; }
        public byte? PastSurgeries { get; set; }
        public string? SurgicalCause { get; set; }
        public string? Disabilities { get; set; }
        public float? Height { get; set; }
        public float? Weight { get; set; }
        public int? VisionLeft { get; set; }
        public int? VisionRight { get; set; }
        public string? ToothDecay { get; set; }
        public string? OtheHealthIssues { get; set; }
    }
}
