using System.ComponentModel.DataAnnotations;

namespace Sever.DTO.SendMedicine
{
    public class MedicineDTO
    {
        public string MedicineID { get; set; }

        [Required]
        public string MedicineName { get; set; }

        [Required]
        public string Quantity { get; set; }

        [Required]
        public string Dosage { get; set; }

        [Required]
        public string Instructions { get; set; }

        [Required]
        public string SentDate { get; set; }

        public string Notes { get; set; }

        [Required]
        public string ParentID { get; set; }
        public string NurseID { get; set; }


        public string Status { get; set; } = "Pending";
    }
}
