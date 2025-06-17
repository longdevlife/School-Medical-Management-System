namespace Sever.DTO.Student
{
    public class GetStudentInfoRequest
    {
        public string StudentID { get; set; }
        public string StudentName { get; set; }
        public string Nationality { get; set; }
        public string Ethnicity { get; set; }
        public DateTime Birthday { get; set; }
        public string Sex { get; set; }
        public string Location { get; set; }
        public string? ParentName { get; set; }
        public string RelationName { get; set; }
        public string? ParentEmail { get; set; }
        public string? ParentPhone { get; set; }
    }
}
