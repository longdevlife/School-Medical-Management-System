namespace Sever.Model
{
    public class Vaccine
    {
        public string VaccineID { get; set; }
        public string VaccineName { get; set; }
        public string Description { get; set; }
        public List<VaccinationRecord> VaccinationRecord { get; set; }
    }
}
