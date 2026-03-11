namespace WebApp;

public static class DebugLog
{
    private static readonly Obj memory = new();

    public static void Start()
    {
        Write();
    }

    private static string GetId(HttpContext context)
    {
        return context.Items.TryGetValue("id", out object value) ? value + "" : null;
    }

    public static void Register(HttpContext context)
    {
        if (!Globals.debugOn) return;

        var id = Guid.NewGuid().ToString();
        context.Items["id"] = id;

        memory[id] = new
        {
            time = DateTime.Now.ToString("yyyy-MM-dd HH\\:mm\\:ss"),
            timestamp = Now,
            timeTakenMs = 0,
            route = context.Request.Method + " " + context.Request.Path.Value
        };
    }

    public static void Add(HttpContext context, object info)
    {
        if (!Globals.debugOn) return;

        var id = GetId(context);
        if (id == null || memory[id] == null) return;

        memory[id] = Obj(new { ___ = memory[id], ___2 = info });
    }

    public static async void Write()
    {
        if (!Globals.debugOn) return;

        while (true)
        {
            memory.GetKeys().ForEach(key =>
            {
                var item = memory[key];
                if (item.RESPONSE_DONE != null || item.timestamp + 5000 < Now)
                {
                    if (item.RESPONSE_DONE != null)
                    {
                        item.timeTakenMs = item.RESPONSE_DONE - item.timestamp;
                        item.Delete("RESPONSE_DONE");
                    }
                    else
                    {
                        item.Delete("timeTaken");
                    }

                    Log(item);
                    memory.Delete(key);
                }
            });

            await Task.Delay(500);
        }
    }

    private static void Log(Obj item)
    {
        try
        {
            Console.WriteLine("\n--- DEBUG LOG ---");

            item.GetKeys().ForEach(key =>
            {
                if (key == null) return; // <-- FIXAR DITT FEL

                var value = item[key];
                Console.WriteLine($"{key}: {value}");
            });

            Console.WriteLine("--- END LOG ---\n");
        }
        catch (Exception ex)
        {
            Console.WriteLine("DEBUGLOG ERROR: " + ex.Message);
        }
    }
}
