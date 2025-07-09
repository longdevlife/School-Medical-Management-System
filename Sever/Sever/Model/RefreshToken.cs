namespace Sever.Model
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = null!;
        public DateTime ExpiryDate { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }

    }
}
