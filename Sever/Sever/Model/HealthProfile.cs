using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class HealthProfile
    {
        [Key]
        public string HealthProfileID { get; set; }
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
        public string StudentID { get; set; }
        [ForeignKey("StudentID")]
        public StudentProfile Student { get; set; }

    }
}
