namespace Sever.DTO.MedicalEvent
{
    public class MedicalEventUpdateDTO
    {
        public string? UpdateNotes { get; set; }
        public string? NewActionTaken { get; set; } // Includes additional supplies/prescriptions
    }
}
