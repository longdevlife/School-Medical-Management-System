using Sever.Model;

namespace Sever.DTO.News
{
    public class GetNews
    {
        public string Title { get; set; }
        public DateTime DateTime { get; set; }
        public string Summary { get; set; }
        public string Body { get; set; }
        public bool Status { get; set; }
        public List<Files> Image { get; set; }
    }
}
