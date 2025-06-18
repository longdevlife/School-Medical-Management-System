using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class Medicine
    {
        [Key]
        [Required]
        public string MedicineID {  get; set; }
        [Required]
        public string MedicineName { get; set; }
        [Required]
        public string Quantity { get; set; }
        [Required]
        public string Dosage { get; set; }
        public string? Instructions { get; set; }
        public DateTime? SentDate { get; set; } = DateTime.Now;
        public string?  Notes { get; set; }
        public string? ParentID { get; set; }
        [ForeignKey("ParentID")]
        public User Parent { get; set; }
        public string? NurseID { get; set; }

        [ForeignKey("NurseID")]
        public User Nurse { get; set; }
        public string Status { get; set; } = "Chờ xử lý"; // Default status
        public ICollection<Files> Files { get; set; }

    }
}
