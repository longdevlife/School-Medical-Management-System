using Sever.DTO.File;
using Sever.Model;

namespace Sever.DTO.Medicine
{
    public class MedicineResponse
    {
        public string? MedicineID { get; set; }
        public string? MedicineName { get; set; }
        public string? Quantity { get; set; }
        public string? Dosage { get; set; }
        public string? Instructions { get; set; }
        public DateTime? SentDate { get; set; }
        public string? Notes { get; set; }
        public List<ImageResponse>? Image { get; set; }
        public string? StudentID { get; set; }
        public string? Class { get; set; }
        public string? StudentName { get; set; }
        public string? NurseID { get; set; }
        public string? ParentID { get; set; }
        public string? Status { get; set; }

    }
}
