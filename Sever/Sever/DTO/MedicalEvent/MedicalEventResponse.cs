using Sever.Model;
using System.ComponentModel.DataAnnotations;

namespace Sever.DTO.MedicalEvent
{
    public class MedicalEventResponse
    {
        public string? MedicalEventID { get; set; }
        public DateTime? EventDateTime { get; set; }
        public string? Description { get; set; }
        public string? ActionTaken { get; set; }
        public string? Notes { get; set; }
        public string? EventTypeID { get; set; }
        public string? NurseID { get; set; }
        public List<string>? StudentID { get; set; }
        public IFormFile? File { get; set; }
        public string Class { get; set; }
        public string StudentName { get; set; }

    }
}
