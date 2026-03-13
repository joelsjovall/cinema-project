using System;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace WebApp
{
  public static class EmailService
  {
    public static void SendEmail(string to, string subject, string body)
    {
      // Path till db-config.json
      var configPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "db-config.json");

      // Läs in JSON
      var configJson = File.ReadAllText(configPath);
      var config = JsonSerializer.Deserialize<Dictionary<string, object>>(configJson);

      // Plocka ut SMTP-inställningar
      var smtpServer = config["smtpServer"].ToString();
      var smtpPort = Convert.ToInt32(config["smtpPort"]);
      var emailUsername = config["emailUsername"].ToString();
      var emailPassword = config["emailPassword"].ToString();

      // Skapa meddelandet
      var message = new MimeMessage();
      message.From.Add(MailboxAddress.Parse(emailUsername));
      message.To.Add(MailboxAddress.Parse(to));
      message.Subject = subject;
      message.Body = new TextPart("html") { Text = body };

      // Skicka meddelandet
      using var client = new SmtpClient();
      client.Connect(smtpServer, smtpPort, SecureSocketOptions.StartTls);
      client.Authenticate(emailUsername, emailPassword);
      client.Send(message);
      client.Disconnect(true);
    }
  }
}
