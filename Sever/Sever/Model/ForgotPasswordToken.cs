namespace Sever.Model
{
    public class ForgotPasswordToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = null!;
        public DateTime ExpiryDate { get; set; }
        public bool IsUsed { get; set; } = false; 
        public string UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
