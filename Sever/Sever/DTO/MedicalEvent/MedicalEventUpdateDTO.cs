namespace Sever.DTO.MedicalEvent
{
    public class MedicalEventUpdateDTO
    {
        public string? MedicalEventID { get; set; }
        public string? Description { get; set; }
        public string? ActionTaken { get; set; }
        public string? Notes { get; set; }
        public string? EventType { get; set; }
        public string? ParentID { get; set; }
        public List<IFormFile> Image { get; set; }

    }
}
