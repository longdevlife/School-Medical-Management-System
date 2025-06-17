namespace Sever.DTO.Notification
{
    public class NotificationDTO
    {
        public string? FormID { get; set; }
        public string UserID { get; set; }
        public string NotifyName { get; set; }
        public DateTime DateTime { get; set; } = DateTime.Now;
        public string Title { get; set; }
        public string? Description { get; set; }
    }
}
