using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class Medicine
    {
        [Key]
        public string MedicineID {  get; set; }
        public string MedicineName { get; set; }
        public string Quantity { get; set; }
        public string Dosage { get; set; }
        public string Instructions { get; set; }
        public string SentDate { get; set; }
        public string? Notes { get; set; }
        public string ParentID { get; set; }
        [ForeignKey("ParentID")]
        public User Parent { get; set; }
    }
}
