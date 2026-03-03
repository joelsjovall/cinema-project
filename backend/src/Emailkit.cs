using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

public class EmailService
{
  public async Task SendEmailAsync(string toEmail, string subject, string body)
  {
    var email = new MimeMessage();

    email.From.Add(new MailboxAddress("Gröna Duken", "yourgmail@gmail.com"));
    email.To.Add(MailboxAddress.Parse(toEmail));
    email.Subject = subject;

    email.Body = new TextPart("html")
    {
      Text = body
    };

    using var smtp = new SmtpClient();

    await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
    await smtp.AuthenticateAsync("yourgmail@gmail.com", "YOUR_APP_PASSWORD");
    await smtp.SendAsync(email);
    await smtp.DisconnectAsync(true);
  }
}