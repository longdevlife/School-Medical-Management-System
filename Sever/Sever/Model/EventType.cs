using System.ComponentModel.DataAnnotations;

namespace Sever.Model
{
    public class EventType
    {
        [Key]
        public string EventTypeID {  get; set; }
        public string EventTypeName {  get; set; }

        public List<MedicalEvent> MedicalEvent { get; set; }
    }
}
