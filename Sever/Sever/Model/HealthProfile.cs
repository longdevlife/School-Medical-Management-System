using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class HealthProfile
    {
        [Key]
        public int HealthProfileID { get; set; }
        public string? AllergyHistory { get; set; }
        public string? ChronicDiseases { get; set; }
        public byte? PastSurgeries { get; set; }
        public string? SurgicalCause { get; set; }
        public string? Disabilities { get; set; }
        public string? Height { get; set; }
        public string? VisionLeft { get; set; }
        public string? VisionRight { get; set; }
        public string? ToothDecay { get; set; }
        public string? OtheHealthIssues { get; set; }
        public string StudentID { get; set; }
        [ForeignKey("StudentID")]
        public StudentProfile Student { get; set; }

    }
}
