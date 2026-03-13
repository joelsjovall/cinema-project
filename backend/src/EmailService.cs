using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace WebApp;

static class EmailService
{

  // Skapar vår funktion som skickar email med 3 parametrar.
  public static void SendEmail(string to, string subject, string body)
  {
    // Sätt path - för att hitta db-config.json
    var configPath = Path.Combine(
        AppContext.BaseDirectory, "..", "..", "..", "db-config.json"
  );
    // Läser in filen "db-config.json"
    var configJson = File.ReadAllText(configPath);
    // Gör om den inlästa filen "db-config.json" till json-format
    var config = JSON.Parse(configJson);

    // Plockar ut konfigurationen från "db-config.json"
    string smtpServer = config.smtpServer;
    int smtpPort = Convert.ToInt32(config.smtpPort);
    string emailUsername = config.emailUsername;
    string emailPassword = config.emailPassword;

    // Sätter ihop ett meddelande med rätt stuktur genom att använda MimeMessage, rekommenderas av MailKit att använda detta.  
    var message = new MimeMessage()
    {
      // From = Avsändarens email, ska vara vår email.
      From = { MailboxAddress.Parse(emailUsername) },
      // To = Motagarens email, den vi ska skicka mail till.
      To = { MailboxAddress.Parse(to) },
      // Subject = Rubriken på mailet 
      Subject = subject,
      // Body = Den meddelande text man vill ha i mailet. 
      // TextPart("html") = Gör att vi kan använda html-element för att strukturera meddelandet. 
      Body = new TextPart("html") { Text = body }
    };

    using (var client = new SmtpClient())
    {
      // Öppnar en uppkoppling till email-providerns server, i vårat fall gmail.
      client.Connect(smtpServer, smtpPort, false);
      // Skickar in verifiering för att kontrollera att vi har en giltig email med stöd för SMTP.
      client.Authenticate(emailUsername, emailPassword);
      // Skickar meddelandet
      client.Send(message);
      // Stänger uppkopplingen när vi är klara.
      client.Disconnect(true);
    }
  }
}