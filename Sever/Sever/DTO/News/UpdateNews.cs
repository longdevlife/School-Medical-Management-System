namespace Sever.DTO.News
{
    public class UpdateNews
    {
        public string NewsID {  get; set; }
        public string Title { get; set; }
        public string Summary { get; set; }
        public string Body { get; set; }
        public List<IFormFile> Image {  get; set; }
    }
}
