using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.Model
{
    public class Vaccine
    {
        public int VaccineID { get; set; }
        public string VaccineName { get; set; }
        public string Description { get; set; }
        //public string UserID {  get; set; }
        //[ForeignKey("UserID")]
        public User User { get; set; }
        public List<VaccinationRecord> VaccinationRecord { get; set; }
    }
}