namespace Sever.DTO.Student
{
    public class UpdateStudentRequest
    {
        public string StudentID { get; set; }
        public string? StudentName { get; set; }
        public string? Class { get; set; }
        public IFormFile? StudentAvata { get; set; }
        public string? RelationName { get; set; }
        public string? Nationality { get; set; }
        public string? Ethnicity { get; set; }
        public DateTime? Birthday { get; set; }
        public string? Sex { get; set; }
        public string? Location { get; set; }
    }
}
