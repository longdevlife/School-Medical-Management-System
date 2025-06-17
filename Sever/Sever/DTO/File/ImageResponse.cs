namespace Sever.DTO.File
{
    public class ImageResponse
    {
        public string Id { get; set; }
        public string Url { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.Now;
    }
}
