using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class MedicalEvent
    {
        [Key]
        public string MedicalEventID {  get; set; }
        public DateTime EventDateTime { get; set; }
        public string Description { get; set; }
        public string ActionTaken { get; set; }
        public string? Notes { get; set; }
        public string EventTypeID { get; set; }
        [ForeignKey("EventTypeID")]
        public EventType EventType { get; set; }
        public string NurseID { get; set; }
        [ForeignKey("NurseID")]
        public User Nurse { get; set; }
        public List<MedicalEventDetail> MedicalEventDetail { get; set; }
        public List<Files> File {  get; set; }

    }
}
