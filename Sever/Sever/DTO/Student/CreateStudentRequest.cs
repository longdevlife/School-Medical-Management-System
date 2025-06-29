namespace Sever.DTO.Student
{
    public class CreateStudentRequest
    {
        public string StudentName { get; set; }
        public string Class { get; set; }
        public IFormFile? StudentAvata { get; set; }
        public string RelationName { get; set; }
        public string Nationality { get; set; }
        public string Ethnicity { get; set; }
        public DateTime Birthday { get; set; }
        public string Sex { get; set; }
        public string Location { get; set; }
        public string parentUserName { get; set; }
    }
}
