using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class Files
    {
        [Key]
        [Required]
        public int FileID { get; set; }
        [Required]
        public string FileName { get; set; }
        [Required]
        public string FileType { get; set; }
        public byte[]? FileData { get; set; }
        public string? FileLink { get; set; }
        public DateTime UploadDate { get; set; }
        public bool IsActive { get; set; }
        public string? MedicalEventID { get; set; }
        [ForeignKey("MedicalEventID")]
        public MedicalEvent MedicalEvent { get; set; }
        public string? NewsID { get; set; }
        [ForeignKey("NewsID")]
        public News News { get; set; }
        public string? SchoolID { get; set; }
        [ForeignKey("SchoolID")]
        public SchoolInfo SchoolInfo { get; set; }
        public string? MedicineID { get; set; }
        [ForeignKey("MedicineID")]
        public Medicine Medicine { get; set; }
    }
}
