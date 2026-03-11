using MailKit.Net.Smtp;
using MimeKit;

namespace WebApp.Services
{
  public static class EmailService
  {
    public static void SendBookingConfirmation(string toEmail, string movieTitle, DateTime screeningDate, string bookingCode, string seats)
    {
      var message = new MimeMessage();
      message.From.Add(new MailboxAddress("Gröna Duken Bio", "noreply@gronaduken.se"));
      message.To.Add(new MailboxAddress("", toEmail));
      message.Subject = "Bokningsbekräftelse - Gröna Duken Bio";

      message.Body = new TextPart("plain")
      {
        Text = $"Hej!\n\nTack för din bokning.\n\nFilm: {movieTitle}\nTid: {screeningDate}\nBokningskod: {bookingCode}\nPlatser: {seats}\n\nVi ses på bion!"
      };

      using (var client = new SmtpClient())
      {
        client.Connect("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
        client.Authenticate("dinmail@gmail.com", "ditt-lösenord"); // byt till riktiga credentials
        client.Send(message);
        client.Disconnect(true);
      }
    }
  }
}
