using System.ComponentModel.DataAnnotations;

namespace Sever.DTO.MedicalEvent
{
    public class CreateMedicalEvent
    {
        public string Description { get; set; }
        public string ActionTaken { get; set; }
        public string Notes { get; set; }
        public string EventType { get; set; }
        public List<string> StudentID { get; set; }
        public List<IFormFile>? Image { get; set; }
        public string ParentID { get; set; }



    }
}
