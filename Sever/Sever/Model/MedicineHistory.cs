using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class MedicineHistory
    {
        [Key]
        [Required]
        public int HistoryID { get; set; }

        public string ModifiedBy { get; set; }
        public string? ChangeDescription { get; set; }
        public DateTime? ModifiedAt { get; set; } 
        public string PreviousStatus { get; set; }
        public string NewStatus { get; set; }
        public string MedicineID { get; set; }
        [ForeignKey("MedicineID")]
        public Medicine Medicine { get; set; }
    }
}
