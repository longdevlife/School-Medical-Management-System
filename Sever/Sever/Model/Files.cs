using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class Files
    {
        [Key]
        public string FileID { get; set; }
        public string FileName { get; set; }
        public byte[] FileData { get; set; }
        public string UploadDate { get; set; }
        public string? MedicalEventID { get; set; }
        [ForeignKey("MedicalEventID")]
        public MedicalEvent MedicalEvent { get; set; }
        public string? NewsID { get; set; }
        [ForeignKey("NewsID")]
        public News News { get; set; }
        public string SchoolID { get; set; }
        [ForeignKey("SchoolID")]
        public SchoolInfo SchoolInfo { get; set; }
    }
}
