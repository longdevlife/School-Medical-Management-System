using System.ComponentModel.DataAnnotations;

namespace Sever.DTO.SendMedicine
{
    public class MedicineUpdateDTO
    {

        public string? MedicineName { get; set; }

        public string? Quantity { get; set; }

        public string? Dosage { get; set; }

        public string? Instructions { get; set; }

        public DateTime? SentDate { get; set; } = DateTime.Now;

        public string? Notes { get; set; }

    }
}
