namespace Sever.Model
{
    public class Notify
    {
        public string FormID {  get; set; }
        public Form Form { get; set; }
        public string UserID { get; set; }
        public User User { get; set; }
        public string NotifyName { get; set; }
        public DateTime DateTime { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        
    }
}
