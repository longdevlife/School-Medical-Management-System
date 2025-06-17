using System.ComponentModel.DataAnnotations;

namespace Sever.DTO.SendMedicine
{
    public class MedicineDTO
    {

        [Required]
        public string MedicineName { get; set; }

        [Required]
        public string Quantity { get; set; }

        [Required]
        public string Dosage { get; set; }

        public string Instructions { get; set; }

        public DateTime? SentDate { get; set; } = DateTime.Now;

        public string Notes { get; set; }

        public string Status { get; set; } = "Chờ xử lý";
    }
}
