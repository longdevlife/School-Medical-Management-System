namespace Sever.DTO
{
    public class MedicineCreateDTO
    {
        public string StudentID { get; set; }
        public string ParentID { get; set; }
        public string NurseID { get; set; }
        public string Notes { get; set; }
        public List<MedicineDoseDTO> Doses { get; set; }
        public List<IFormFile> Attachments { get; set; }
    }


}
