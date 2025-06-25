using Sever.Model;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.DTO.Vaccination
{
    public class VaccineReponse
    {
        public string RecordID { get; set; }
        public int Dose { get; set; }
        public DateTime DateTime { get; set; }
        public string? Notes { get; set; }
        public string Status { get; set; }
        public DateTime? VaccinatedAt { get; set; }
        public string? FollowUpNotes { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string StudentID { get; set; }
        public string? ParentID { get; set; }
        public string? NurseID { get; set; }
        public int VaccineID { get; set; }
        public string? VaccinatorID { get; set; }
    }
}
