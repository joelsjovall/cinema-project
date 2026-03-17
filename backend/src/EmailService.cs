using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace WebApp
{
  public static class EmailService
  {
    public static void SendBookingConfirmation(
      string to,
      string movieTitle,
      string screeningDate,
      string bookingCode,
      string seats
    )
    {
      var subject = "Din bokning hos Grona Duken";
      var body =
        "<h2>Tack for din bokning!</h2>" +
        $"<p><strong>Film:</strong> {movieTitle}</p>" +
        $"<p><strong>Datum:</strong> {screeningDate}</p>" +
        $"<p><strong>Platser:</strong> {seats}</p>" +
        $"<p><strong>Bokningskod:</strong> {bookingCode}</p>";

      SendEmail(to, subject, body);
    }

    public static void SendEmail(string to, string subject, string body)
    {
      var message = new MimeMessage();
      message.From.Add(new MailboxAddress("Gröna Duken", "lukas.eson@gmail.com"));
      message.To.Add(new MailboxAddress("", to));
      message.Subject = subject;
      message.Body = new TextPart("html") { Text = body };

      using (var client = new SmtpClient())
      {
        // Exempel: Gmail SMTP
        client.Connect("smtp.gmail.com", 587, SecureSocketOptions.StartTls);

        // Här måste du använda en riktig adress + app‑lösenord
        client.Authenticate("lukas.eson@gmail.com", "iuvv bsxn qjqa flho");

        client.Send(message);
        client.Disconnect(true);
      }
    }
  }
}
