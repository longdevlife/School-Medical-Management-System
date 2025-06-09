using System.ComponentModel.DataAnnotations;

namespace Sever.Model
{
    public class MedicineHistory
    {
        [Key]
        public int HistoryID { get; set; }
        public string MedicineID { get; set; }
        public string ModifiedBy { get; set; }
        public string ChangeDescription { get; set; }
        public DateTime ModifiedAt { get; set; }
        public string PreviousStatus { get; set; }
        public string NewStatus { get; set; }
        public Medicine Medicine { get; set; }
    }
}
