using Sever.Model;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.DTO.Vaccination
{
    public class UpdateVaccineDTO
    {
        public int? Dose { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
        public DateTime? VaccinatedAt { get; set; }
        public string? StudentID { get; set; }
        public int? VaccineID { get; set; }
        public string? VaccinatorID { get; set; }
    }
}
