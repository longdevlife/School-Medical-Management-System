namespace ConsoleApp1
{
    internal class Program
    {
        static void Main(string[] args)
        {
            var password = "user123"; // Mật khẩu em muốn mã hóa
            var hasher = new PasswordHasher<object>();
            var hashed = hasher.HashPassword(null, password);

            Console.WriteLine($"Password: {password}");
            Console.WriteLine($"Hash: {hashed}");

        }
    }
}
