namespace Sever.DTO.Medicine
{
    public class MedicineStatusUpdate
    {
        public string? MedicineName { get; set; }
        public string? Quantity { get; set; }
        public string? Dosage { get; set; }
        public string? Instructions { get; set; }
        public DateTime? SentDate { get; set; }
        public string? Notes { get; set; }
        public List<IFormFile> Image { get; set; }
        public string Status { get; set; }  
        public string  StudentID { get; set; }
        public string ParentID { get; set; }

    }
}
