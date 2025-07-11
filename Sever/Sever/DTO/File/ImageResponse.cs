namespace Sever.DTO.File
{
    public class ImageResponse
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public string? FileName { get; set; }
        public string? FileType { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.Now;
    }
}
