using System.ComponentModel.DataAnnotations;

namespace Sever.DTO.SendMedicine
{
    public class MedicineUpdateDTO
    {
        public string? MedicineName { get; set; }
        public string? Quantity { get; set; }
        public string? Dosage { get; set; }
        public string? Instructions { get; set; }
        public DateTime? SentDate { get; set; }
        public string? Notes { get; set; }
        public List<IFormFile> Image { get; set; }
        public string StudentID { get; set; }
        public string NurseID { get; set; }
    }
}
