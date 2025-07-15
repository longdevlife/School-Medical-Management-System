using System.Net.Mail;

namespace Sever.Service
{
    public interface IEmailService
    {
        Task SendEmailAsync(string email, string subject, string message);
    }

    public class EmailSevice : IEmailService
    {
        public async Task SendEmailAsync(string email, string subject, string message)
        {
            var client = new SmtpClient("smtp.gmail.com", 587)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new System.Net.NetworkCredential("truonglsse180413@fpt.edu.vn", "mxsybfvgfngtuhfe")
            };

            var mail = new MailMessage
            {
                From = new MailAddress("truonglsse180413@fpt.edu.vn"),
                Subject = subject,
                Body = message,
                IsBodyHtml = true
            };

            mail.To.Add(email);

            await client.SendMailAsync(mail);
        }
    }
}
