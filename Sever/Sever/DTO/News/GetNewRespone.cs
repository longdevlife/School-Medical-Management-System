namespace Sever.DTO.News
{
    public class GetNewRespone
    {
        public string NewsID { get; set; }
        public string Title { get; set; }
        public DateTime DateTime { get; set; }
        public string Summary { get; set; }
        public string Body { get; set; }
        public List<string> Image { get; set; }
        public bool Status { get; set; }
        public string UserID { get; set; }
    }
}
