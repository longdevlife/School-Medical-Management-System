using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class MedicineDose
    {
        [Key]
        [StringLength(50)]
        public string DoseID { get; set; }

        [Required]
        [StringLength(50)]
        public string MedicineID  { get; set; }

        [Required]
        [StringLength(255)]
        public string MedicineName { get; set; }

        [Required]
        [StringLength(255)]
        public string Dosage { get; set; }

        [Required]
        [StringLength(100)]
        public string TimeToTake { get; set; }

        public string SpecialInstruction { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending";

        public string Notes { get; set; }

        [ForeignKey("MedicineID")]
        public virtual Medicine Medicine { get; set; }
    }
}
