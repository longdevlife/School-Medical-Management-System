namespace Sever.DTO.File
{
    public class ImageUpload
    {
        public IFormFile File { get; set; }
        public string? MedicineID { get; set; }
        public string? MedicalEventID { get; set; }
        public string? StudentID { get; set; } 

    }
}
