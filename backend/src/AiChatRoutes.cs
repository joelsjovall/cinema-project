namespace WebApp;
public static class AiChatRoutes
{
    private static string aiAccessToken = "";
    private static string systemPrompt = "";
    private static readonly string proxyUrl = "https://ai-api.nodehill.com";
    private static readonly HttpClient httpClient = new HttpClient();

    public static void Start()
    {
        LoadConfig();
        LoadSystemPrompt();

        App.MapPost("/api/chat", async (HttpContext context, JsonElement bodyJson) =>
        {
            try
            {
                var body = JSON.Parse(bodyJson.ToString());
                var messages = (Arr)body.messages;

                if (messages == null || messages.Length == 0)
                    return RestResult.Parse(context, new { error = "Messages array is required." });

                var lastUserMessage = GetLastUserMessage(messages);

                if (!string.IsNullOrWhiteSpace(lastUserMessage))
                {
                    var directAnswer = TryGetDirectAnswer(lastUserMessage);

                    if (!string.IsNullOrWhiteSpace(directAnswer))
                        return RestResult.Parse(context, CreateAssistantResponse(directAnswer));
                }

                var fullMessages = Arr();
                var fallbackPrompt = BuildFallbackSystemPrompt();

                if (!string.IsNullOrWhiteSpace(fallbackPrompt))
                {
                    fullMessages.Push(Obj(new
                    {
                        role = "system",
                        content = fallbackPrompt
                    }));
                }

                messages.ForEach(msg => fullMessages.Push(msg));

                var requestBody = Obj(new
                {
                    messages = fullMessages
                });

                var request = new HttpRequestMessage(
                    HttpMethod.Post,
                    $"{proxyUrl}/v1/chat/completions"
                );

                request.Headers.Add("Authorization", $"Bearer {aiAccessToken}");
                request.Content = new StringContent(
                    JSON.Stringify(requestBody),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                var response = await httpClient.SendAsync(request);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    return RestResult.Parse(context, new
                    {
                        error = "AI API returned an error.",
                        details = responseContent
                    });

                return RestResult.Parse(context, JSON.Parse(responseContent));
            }
            catch (Exception ex)
            {
                return RestResult.Parse(context, new { error = ex.Message });
            }
        });
    }

    private static string GetLastUserMessage(Arr messages)
    {
        for (var i = messages.Length - 1; i >= 0; i--)
        {
            if ((messages[i].role + "").ToLower() == "user")
                return (messages[i].content + "").Trim();
        }

        return "";
    }

    private static object CreateAssistantResponse(string text)
    {
        return new
        {
            choices = Arr(
                Obj(new
                {
                    message = Obj(new
                    {
                        role = "assistant",
                        content = text
                    })
                })
            )
        };
    }

    private static string TryGetDirectAnswer(string userText)
    {
        var text = Normalize(userText);

        if (IsOpeningHoursQuestion(text))
            return GetOpeningHoursAnswer();

        if (IsTicketPriceQuestion(text))
            return GetTicketPricesAnswer();

        if (IsCinemaFocusQuestion(text))
            return GetCinemaFocusAnswer();

        if (IsKioskQuestion(text))
            return GetKioskAnswer();

        if (IsBookingQuestion(text))
            return GetBookingAnswer();

        if (IsSalonsQuestion(text))
            return GetSalonsAnswer();

        var movieTitle = FindMovieTitleInText(userText);

        if (!string.IsNullOrWhiteSpace(movieTitle) && IsMovieScheduleQuestion(text))
            return GetMovieScheduleAnswer(movieTitle);

        return "";
    }

    private static string Normalize(string text)
    {
        return (text ?? "").Trim().ToLower();
    }

    private static bool IsOpeningHoursQuestion(string text)
    {
        return
            text.Contains("öppettider") ||
            text.Contains("oppettider") ||
            text.Contains("när öppnar") ||
            text.Contains("nar oppnar") ||
            text.Contains("när stänger") ||
            text.Contains("nar stanger");
    }

    private static bool IsTicketPriceQuestion(string text)
    {
        return
            text.Contains("vad kostar") ||
            text.Contains("biljettpris") ||
            text.Contains("biljettpriser") ||
            text.Contains("vuxenbiljett") ||
            text.Contains("barnbiljett") ||
            text.Contains("pensionärsbiljett") ||
            text.Contains("pensionarsbiljett");
    }

    private static bool IsCinemaFocusQuestion(string text)
    {
        return
            text.Contains("inriktning") ||
            text.Contains("vad är ni för biograf") ||
            text.Contains("vad ar ni for biograf") ||
            text.Contains("vad visar ni för filmer") ||
            text.Contains("vad visar ni for filmer");
    }

    private static bool IsKioskQuestion(string text)
    {
        return
            text.Contains("kiosk") ||
            text.Contains("snacks") ||
            text.Contains("popcorn") ||
            text.Contains("godis") ||
            text.Contains("chips") ||
            text.Contains("läsk") ||
            text.Contains("lask");
    }

    private static bool IsBookingQuestion(string text)
    {
        return
            text.Contains("hur bokar jag") ||
            text.Contains("hur fungerar bokningen") ||
            text.Contains("hur köper jag biljett") ||
            text.Contains("hur koper jag biljett");
    }

    private static bool IsSalonsQuestion(string text)
    {
        return
            text.Contains("salonger") ||
            text.Contains("platser") ||
            text.Contains("hur stor") ||
            text.Contains("hur många platser") ||
            text.Contains("hur manga platser");
    }

    private static bool IsMovieScheduleQuestion(string text)
    {
        return
            text.Contains("när går") ||
            text.Contains("nar gar") ||
            text.Contains("vilka tider") ||
            text.Contains("när visas") ||
            text.Contains("nar visas") ||
            text.Contains("visningstider");
    }

    private static string FindMovieTitleInText(string userText)
    {
        try
        {
            var rows = SQLQuery(@"SELECT title FROM movies ORDER BY title");
            var input = Normalize(userText);

            foreach (var row in rows)
            {
                var title = row.title + "";
                if (input.Contains(Normalize(title)))
                    return title;
            }

            return "";
        }
        catch
        {
            return "";
        }
    }

    private static string GetOpeningHoursAnswer()
    {
        // Ändra texten om hemsidan säger något annat
        return "Biografens öppettider finns på hemsidan. Vanligtvis öppnar biografen i samband med dagens visningar.";
    }

    private static string GetTicketPricesAnswer()
    {
        try
        {
            var rows = SQLQuery(@"SELECT name, price FROM ticketTypes ORDER BY price DESC");

            if (rows == null || rows.Length == 0)
                return "Det finns inga biljettpriser just nu.";

            var text = "Biljettpriser:\n";

            foreach (var row in rows)
                text += "- " + row.name + ": " + row.price + " kr\n";

            return text.Trim();
        }
        catch
        {
            return "Det gick inte att läsa biljettpriserna just nu.";
        }
    }

    private static string GetCinemaFocusAnswer()
    {
        // Ändra texten om ni vill beskriva biografen på annat sätt
        return "Gröna Duken är en biograf där du kan se aktuella filmer och läsa information om visningar, salonger och bokning direkt på webbplatsen.";
    }

    private static string GetKioskAnswer()
    {
        return "I kiosken finns till exempel popcorn, godis, chips och läsk.";
    }

    private static string GetBookingAnswer()
    {
        return
            "Så här bokar du:\n" +
            "1. Välj film\n" +
            "2. Välj visning\n" +
            "3. Välj platser\n" +
            "4. Slutför bokningen\n\n" +
            "Betalning sker på plats i biografen.";
    }

    private static string GetSalonsAnswer()
    {
        try
        {
            var rows = SQLQuery(@"SELECT name, totalSeats FROM salons ORDER BY name");

            if (rows == null || rows.Length == 0)
                return "Det finns inga salonger just nu.";

            var text = "Våra salonger:\n";

            foreach (var row in rows)
                text += "- " + row.name + ": " + row.totalSeats + " platser\n";

            return text.Trim();
        }
        catch
        {
            return "Det gick inte att läsa salongerna just nu.";
        }
    }

    private static string GetMovieScheduleAnswer(string movieTitle)
    {
        try
        {
            var escapedTitle = EscapeSql(movieTitle);

            var rows = SQLQuery($@"SELECT s.screeningDate, s.screeningTime, sal.name AS salonName
                FROM screenings s
                JOIN movies m ON m.id = s.movieId
                JOIN salons sal ON sal.id = s.salonId
                WHERE m.title = '{escapedTitle}'
                AND TIMESTAMP(s.screeningDate, s.screeningTime) >= NOW()
                ORDER BY s.screeningDate, s.screeningTime");

            if (rows == null || rows.Length == 0)
                return $"Det finns inga kommande visningar för {movieTitle} just nu.";

            var text = movieTitle + " visas:\n";

            foreach (var row in rows)
            {
                text += "- " + FormatDate(row.screeningDate) +
                        " kl. " + FormatTime(row.screeningTime) +
                        " i " + row.salonName + "\n";
            }

            return text.Trim();
        }
        catch
        {
            return "Det gick inte att läsa visningstiderna just nu.";
        }
    }

    private static string BuildFallbackSystemPrompt()
    {
        if (string.IsNullOrWhiteSpace(systemPrompt))
            return "";

        return systemPrompt;
    }

    private static string FormatDate(dynamic value)
    {
        try
        {
            return Convert.ToDateTime(value + "").ToString("yyyy-MM-dd");
        }
        catch
        {
            return value + "";
        }
    }

    private static string FormatTime(dynamic value)
    {
        try
        {
            return TimeSpan.Parse(value + "").ToString(@"hh\:mm");
        }
        catch
        {
            return value + "";
        }
    }

    private static string EscapeSql(string text)
    {
        return (text ?? "").Replace("'", "''");
    }

    private static void LoadConfig()
    {
        try
        {
            var configPath = Path.Combine(
                AppContext.BaseDirectory, "..", "..", "..", "db-config.json"
            );

            var configJson = File.ReadAllText(configPath);
            var config = JSON.Parse(configJson);

            if (config.aiAccessToken != null)
                aiAccessToken = (string)config.aiAccessToken;
        }
        catch (Exception ex)
        {
            Log("Error loading AI access token:", ex.Message);
        }
    }

    private static void LoadSystemPrompt()
    {
        try
        {
            var promptPath = Path.Combine(
                AppContext.BaseDirectory, "..", "..", "..", "system-prompt.md"
            );

            if (File.Exists(promptPath))
                systemPrompt = File.ReadAllText(promptPath);
        }
        catch (Exception ex)
        {
            Log("Error loading system prompt:", ex.Message);
        }
    }
}