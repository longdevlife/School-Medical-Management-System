namespace Sever.DTO.Vaccination
{
    public class UpdateVaccineAfterDTO
    {
        public DateTime DateTime { get; set; }
        public string? Status { get; set; }
        public string? FollowUpNotes { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string? StudentID { get; set; }
    }
}
