namespace WebApp;

public static class AiChatRoutes
{
    private static string aiAccessToken = "";
    private static string systemPrompt = "";
    private static readonly HttpClient httpClient = new HttpClient();
    private static readonly string proxyUrl = "https://ai-api.nodehill.com";

    public static void Start()
    {
        LoadConfig();
        LoadSystemPrompt();

        Server.App.MapPost("/api/chat", async (HttpContext context, JsonElement bodyJson) =>
        {
            try
            {
                var body = JSON.Parse(bodyJson.ToString());
                var messages = (Arr)body.messages;

                if (messages == null)
                {
                    return RestResult.Parse(context, new { error = "Messages array is required." });
                }

                var lastMessage = messages.Length > 0
                    ? messages[messages.Length - 1].content + ""
                    : "";

                if (IsMovieListQuestion(lastMessage))
                {
                    return RestResult.Parse(context, new
                    {
                        choices = Arr(
                            Obj(new
                            {
                                message = Obj(new
                                {
                                    role = "assistant",
                                    content = GetMovieTitlesReply()
                                })
                            })
                        )
                    });
                }

                var prompt = systemPrompt;

                if (!string.IsNullOrEmpty(systemPrompt))
                {
                    prompt += "\n\n" + GetMovieTitlesText();
                }

                var fullMessages = Arr();

                if (!string.IsNullOrEmpty(prompt))
                {
                    fullMessages.Push(Obj(new
                    {
                        role = "system",
                        content = prompt
                    }));
                }

                messages.ForEach(msg => fullMessages.Push(msg));

                var request = new HttpRequestMessage(
                    HttpMethod.Post,
                    $"{proxyUrl}/v1/chat/completions"
                );

                request.Headers.Add("Authorization", $"Bearer {aiAccessToken}");
                request.Content = new StringContent(
                    JSON.Stringify(Obj(new { messages = fullMessages })),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                var response = await httpClient.SendAsync(request);
                var responseText = await response.Content.ReadAsStringAsync();
                var data = JSON.Parse(responseText);

                return RestResult.Parse(context, data);
            }
            catch (Exception ex)
            {
                return RestResult.Parse(context, new { error = ex.Message });
            }
        });
    }

    private static bool IsMovieListQuestion(string text)
    {
        text = text.ToLower();

        return
            text.Contains("vilka filmer") ||
            text.Contains("filmer finns") ||
            text.Contains("filmer visas") ||
            text.Contains("lista filmer");
    }

    private static string GetMovieTitlesReply()
    {
        try
        {
            var movies = SQLQuery(@"SELECT title AS movieTitle
FROM movies
ORDER BY title
LIMIT 10");

            if (movies == null || movies.Length == 0)
            {
                return "Det finns inga filmer i systemet just nu.";
            }

            var text = "Här är filmerna som finns just nu:\n";

            foreach (var movie in movies)
            {
                text += $"- {movie.movieTitle}\n";
            }

            return text;
        }
        catch (Exception ex)
        {
            return "Det gick inte att läsa filmerna från systemet. " + ex.Message;
        }
    }

    private static string GetMovieTitlesText()
    {
        try
        {
            var movies = SQLQuery(@"SELECT title AS movieTitle
FROM movies
ORDER BY title
LIMIT 10");

            if (movies == null || movies.Length == 0)
            {
                return "Systeminformation om filmer:\nInga filmer hittades.";
            }

            var text = "Systeminformation om filmer:\nHär är filmtitlarna som finns i systemet:\n";

            foreach (var movie in movies)
            {
                text += $"- {movie.movieTitle}\n";
            }

            return text;
        }
        catch
        {
            return "Systeminformation om filmer:\nDet gick inte att läsa filmer från systemet.";
        }
    }

    private static void LoadConfig()
    {
        try
        {
            var path = Path.Combine(
                AppContext.BaseDirectory, "..", "..", "..", "db-config.json"
            );

            if (!File.Exists(path))
            {
                Log("db-config.json not found");
                return;
            }

            var config = JSON.Parse(File.ReadAllText(path));

            if (config.aiAccessToken != null)
            {
                aiAccessToken = (string)config.aiAccessToken;
            }
            else
            {
                Log("aiAccessToken not found in db-config.json");
            }
        }
        catch (Exception ex)
        {
            Log("Error loading config:", ex.Message);
        }
    }

    private static void LoadSystemPrompt()
    {
        try
        {
            var path = Path.Combine(
                AppContext.BaseDirectory, "..", "..", "..", "system-prompt.md"
            );

            if (File.Exists(path))
            {
                systemPrompt = File.ReadAllText(path);
            }
            else
            {
                Log("system-prompt.md not found");
            }
        }
        catch (Exception ex)
        {
            Log("Error loading system prompt:", ex.Message);
        }
    }
}