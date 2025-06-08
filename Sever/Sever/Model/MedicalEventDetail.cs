using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class MedicalEventDetail
    {
        public int MedicalEventID { get; set; }
        [ForeignKey("MedicalEventID")]
        public MedicalEvent MedicalEvent { get; set; }
        public string StudentID { get; set; }
        [ForeignKey("StudentID")]
        public StudentProfile StudentProfile { get; set; }
    }
}
