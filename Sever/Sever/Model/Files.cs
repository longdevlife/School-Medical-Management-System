using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class Files
    {
        [Key]
        public int FileID { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public byte[]? FileData { get; set; }
        public string? FileLink { get; set; }
        public DateTime UploadDate { get; set; }
        public int? MedicalEventID { get; set; }
        [ForeignKey("MedicalEventID")]
        public MedicalEvent MedicalEvent { get; set; }
        public int? NewsID { get; set; }
        [ForeignKey("NewsID")]
        public News News { get; set; }
        public string? SchoolID { get; set; }
        [ForeignKey("SchoolID")]
        public SchoolInfo SchoolInfo { get; set; }
    }
}
