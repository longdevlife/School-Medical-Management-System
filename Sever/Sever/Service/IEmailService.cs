using System.Net.Mail;

namespace Sever.Service
{
    public interface IEmailService
    {
        Task SendEmailAsync(string email, string subject, string message);

    }

    public class EmailSevice : IEmailService
    {
        public Task SendEmailAsync(string email, string subject, string message)
        {
            var client = new SmtpClient("smtp.gmail.com", 587)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new System.Net.NetworkCredential("truonglsse180413@fpt.edu.vn", "mxsybfvgfngtuhfe")
            };

            return  client.SendMailAsync(new MailMessage(from: "truonglsse180413@fpt.edu.vn",
                                                            to: email,
                                                            subject: subject,
                                                            body: message));
        }
    }
}
