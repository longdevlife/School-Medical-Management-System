using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class VaccinationRecord
    {
        [Key]
        public string RecordID { get; set; }
        public int Dose { get; set; }
        public DateTime DateTime { get; set; }
        public string? Notes { get ; set; }
        public string? Status { get; set; }
        public DateTime? VaccinatedAt { get; set; }
        public string? FollowUpNotes { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string? StudentID { get; set; }
        [ForeignKey("StudentID")]
        public StudentProfile StudentProfile { get; set; }
        public string? NurseID { get; set; }
        [ForeignKey("NurseID")]
        public User Nurse { get; set; }
        public int VaccineID {  get; set; }
        [ForeignKey("VaccineID")]
        public Vaccine Vaccine { get; set; }
        public string? VaccinatorID { get; set; }
        [ForeignKey("VaccinatorID")]
        public User Vaccinator { get; set; }
    }
}
