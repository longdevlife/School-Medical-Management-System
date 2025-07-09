using Sever.Model;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.DTO.Vaccination
{
    public class CreateVaccination
    {
        public int VaccineID { get; set; }           
        public int Dose { get; set; }                
        public string? Notes { get; set; }           
        public DateTime VaccinatedAt { get; set; }
        public string? StudentID { get; set; }
        public string? ClassID { get; set; }

    }
}


