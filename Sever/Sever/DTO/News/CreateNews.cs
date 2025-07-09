namespace Sever.DTO.News
{
    public class CreateNews
    {
        public string Title { get; set; }
        public string Summary { get; set; }
        public string Body { get; set; }
        public List<IFormFile> Image {  get; set; }
    }
}
