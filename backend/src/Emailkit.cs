using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

public class EmailService
{
  public async Task SendEmailAsync(string toEmail, string subject, string body)
  {
    try
    {
      Console.WriteLine("EMAIL METHOD CALLED");
      Console.WriteLine("Sending to: " + toEmail);

      var email = new MimeMessage();

      email.From.Add(new MailboxAddress("Gröna Duken", "lukas.eson@gmail.com"));
      email.To.Add(MailboxAddress.Parse(toEmail));
      email.Subject = subject;
      email.Body = new TextPart("html") { Text = body };

      using var smtp = new SmtpClient();

      Console.WriteLine("Connecting to Gmail...");
      await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);

      Console.WriteLine("Authenticating...");
      await smtp.AuthenticateAsync("lukas.eson@gmail.com", "iuvv bsxn qjqaflho");
      Console.WriteLine("Sending mail...");
      await smtp.SendAsync(email);

      await smtp.DisconnectAsync(true);

      Console.WriteLine("MAIL SENT SUCCESSFULLY");
    }
    catch (Exception ex)
    {
      Console.WriteLine("EMAIL SERVICE ERROR:");
      Console.WriteLine(ex.ToString());
      throw;
    }
  }
}