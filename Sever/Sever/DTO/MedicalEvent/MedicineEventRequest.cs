using System.ComponentModel.DataAnnotations;

namespace Sever.DTO.MedicalEvent
{
    public class MedicineEventRequest
    {
        public DateTime? EventDateTime { get; set; } = DateTime.UtcNow;
        public string? Description { get; set; }
        [Required]
        public string? ActionTaken { get; set; } // Includes supplies and prescriptions used
        public string? Notes { get; set; }
        [Required]
        public string? EventTypeID { get; set; }
        public List<string> StudentID { get; set; }
    }
}
