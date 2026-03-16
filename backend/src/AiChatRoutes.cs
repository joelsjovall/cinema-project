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

                if (messages == null)
                {
                    return RestResult.Parse(context, new { error = "Messages array is required." });
                }

                var fullMessages = Arr();
                var cinemaContext = GetCinemaContext();
                var combinedSystemPrompt = BuildSystemPrompt(cinemaContext);

                if (!string.IsNullOrWhiteSpace(combinedSystemPrompt))
                {
                    fullMessages.Push(Obj(new
                    {
                        role = "system",
                        content = combinedSystemPrompt
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
                {
                    try
                    {
                        var error = JSON.Parse(responseContent);
                        return RestResult.Parse(context, error);
                    }
                    catch
                    {
                        return RestResult.Parse(context, new
                        {
                            error = "AI API returned an error.",
                            details = responseContent
                        });
                    }
                }

                var data = JSON.Parse(responseContent);
                return RestResult.Parse(context, data);
            }
            catch (Exception ex)
            {
                return RestResult.Parse(context, new { error = ex.Message });
            }
        });
    }

    private static string BuildSystemPrompt(string cinemaContext)
    {
        if (string.IsNullOrWhiteSpace(systemPrompt) && string.IsNullOrWhiteSpace(cinemaContext))
        {
            return "";
        }

        if (string.IsNullOrWhiteSpace(systemPrompt))
        {
            return cinemaContext;
        }

        if (string.IsNullOrWhiteSpace(cinemaContext))
        {
            return systemPrompt;
        }

        return systemPrompt + "\n\n" + cinemaContext;
    }

    private static string GetCinemaContext()
    {
        try
        {
            var text = "SYSTEMINFORMATION FÖR GRÖNA DUKEN\n";

            text += "\nAlla filmer på hemsidan:\n";
            text += GetAllMoviesText();

            text += "\n\nKommande visningar:\n";
            text += GetUpcomingScreeningsText();

            text += "\n\nBiljettpriser:\n";
            text += GetTicketPricesText();

            text += "\n\nSalonger:\n";
            text += GetSalonsText();

            text += "\n\nBokning:\n";
            text +=
                "1. Välj film\n" +
                "2. Välj datum och tid\n" +
                "3. Välj platser\n" +
                "4. Kontrollera totalpris\n" +
                "5. Slutför bokningen\n" +
                "Betalning sker på plats i biografen med bokningsnummer.\n";

            return text.Trim();
        }
        catch
        {
            return "Systeminformation saknas just nu.";
        }
    }

    private static string GetMoviesText()
    {
        try
        {
            var rows = SQLQuery(@"SELECT DISTINCT
                m.id,
                m.title,
                m.genre,
                m.age_restriction,
                m.length_minutes
                FROM movies m
                JOIN screenings s ON s.movieId = m.id
                WHERE TIMESTAMP(s.screeningDate, s.screeningTime) >= NOW()
                ORDER BY m.title");

            if (rows == null || rows.Length == 0)
            {
                return "Inga filmer med bokningsbara visningar hittades.";
            }

            var text = "Antal filmer med bokningsbara visningar: " + rows.Length + "\n";

            foreach (var row in rows)
            {
                var genre = row.genre == null ? "okänd genre" : row.genre + "";
                var ageRestriction = row.age_restriction == null ? "okänd åldersgräns" : row.age_restriction + "";
                var length = row.length_minutes == null ? "okänd längd" : row.length_minutes + " min";

                text += "- " + row.title + " (" + genre + ", " + length + ", " + ageRestriction + " år)\n";
            }

            return text.Trim();
        }
        catch
        {
            return "Det gick inte att läsa filmer.";
        }
    }

    private static string GetAllMoviesText()
    {
        try
        {
            var rows = SQLQuery(@"SELECT title, genre, age_restriction, length_minutes
                FROM movies
                ORDER BY title");

            if (rows == null || rows.Length == 0)
            {
                return "Inga filmer hittades.";
            }

            var text = "Antal filmer på hemsidan: " + rows.Length + "\n";

            foreach (var row in rows)
            {
                var genre = row.genre == null ? "okänd genre" : row.genre + "";
                var ageRestriction = row.age_restriction == null ? "okänd åldersgräns" : row.age_restriction + "";
                var length = row.length_minutes == null ? "okänd längd" : row.length_minutes + " min";

                text += "- " + row.title + " (" + genre + ", " + length + ", " + ageRestriction + " år)\n";
            }

            return text.Trim();
        }
        catch
        {
            return "Det gick inte att läsa alla filmer.";
        }
    }

    private static string GetUpcomingScreeningsText()
    {
        try
        {
            var rows = SQLQuery(@"SELECT
                m.title,
                s.screeningDate,
                s.screeningTime,
                sal.name AS salonName
                FROM screenings s
                JOIN movies m ON s.movieId = m.id
                JOIN salons sal ON s.salonId = sal.id
                WHERE TIMESTAMP(s.screeningDate, s.screeningTime) >= NOW()
                ORDER BY s.screeningDate, s.screeningTime
                LIMIT 30");

            if (rows == null || rows.Length == 0)
            {
                return "Inga kommande visningar hittades.";
            }

            var text = "";

            foreach (var row in rows)
            {
                text += "- " + row.title + " " + row.screeningDate + " kl. " + row.screeningTime + " i " + row.salonName + "\n";
            }

            return text.Trim();
        }
        catch
        {
            return "Det gick inte att läsa kommande visningar.";
        }
    }

    private static string GetTicketPricesText()
    {
        try
        {
            var rows = SQLQuery(@"SELECT name, price
                FROM ticketTypes
                ORDER BY price DESC");

            if (rows == null || rows.Length == 0)
            {
                return "Inga biljettpriser hittades.";
            }

            var text = "";

            foreach (var row in rows)
            {
                text += "- " + row.name + ": " + row.price + " kr\n";
            }

            return text.Trim();
        }
        catch
        {
            return "Det gick inte att läsa biljettpriser.";
        }
    }

    private static string GetSalonsText()
    {
        try
        {
            var rows = SQLQuery(@"SELECT name, totalSeats
                FROM salons
                ORDER BY name");

            if (rows == null || rows.Length == 0)
            {
                return "Inga salonger hittades.";
            }

            var text = "";

            foreach (var row in rows)
            {
                text += "- " + row.name + ": " + row.totalSeats + " platser\n";
            }

            return text.Trim();
        }
        catch
        {
            return "Det gick inte att läsa salonger.";
        }
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
            {
                aiAccessToken = (string)config.aiAccessToken;
            }
            else
            {
                Log("WARNING: aiAccessToken not found in db-config.json!");
            }
        }
        catch (Exception ex)
        {
            Log("Error loading AI access token from config:", ex.Message);
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
            {
                systemPrompt = File.ReadAllText(promptPath);
                Log("Loaded system prompt from system-prompt.md");
            }
            else
            {
                Log("No system-prompt.md found, running without system prompt");
            }
        }
        catch (Exception ex)
        {
            Log("Error loading system prompt:", ex.Message);
        }
    }
}