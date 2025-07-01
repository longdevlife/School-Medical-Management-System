using System.ComponentModel.DataAnnotations;

namespace Sever.DTO.SendMedicine
{
    public class CreateMedicine
    {
        [Required]
        public string MedicineName { get; set; }
        [Required]
        public string Quantity { get; set; }
        [Required]
        public string Dosage { get; set; }
        public string Instructions { get; set; }
        public string? Notes { get; set; }
        public string StudentID { get; set; }
        public string? Status { get; set; }
        public List<IFormFile>? Image { get; set; }


    }
}
