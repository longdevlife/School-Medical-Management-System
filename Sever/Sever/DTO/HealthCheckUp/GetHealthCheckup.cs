using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.DTO.HealthCheckUp
{
    public class GetHealthCheckup
    {
        public string HealthCheckUpID { get; set; }
        public DateTime? CheckDate { get; set; }
        public string? ClassID { get; set; }
        public string StudentID { get; set; }
        public string? StudentName { get; set; }
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
        public string Status { get; set; }
        public string? CheckerID { get; set; }
        public string? ParentID { get; set; }


    }
}
