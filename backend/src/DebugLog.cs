using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace WebApp
{
    // Klass för loggobjekt
    public class LogItem
    {
        public string time { get; set; }
        public long timestamp { get; set; }
        public long timeTakenMs { get; set; }
        public string route { get; set; }
        public long? RESPONSE_DONE { get; set; }
    }

    public static class DebugLog
    {
        private static readonly ConcurrentDictionary<string, LogItem> memory = new();

        public static void Start()
        {
            Write();
        }

        private static string GetId(HttpContext context)
        {
            return context.Items.TryGetValue("id", out object value) ? value + "" : null;
        }

        // Registrera en request
        public static void Register(HttpContext context)
        {
            if (!Globals.debugOn) { return; }
            var id = Guid.NewGuid().ToString();
            context.Items["id"] = id;

            memory[id] = new LogItem
            {
                time = DateTime.Now.ToString("yyyy-MM-dd HH\\:mm\\:ss"),
                timestamp = Now,
                timeTakenMs = 0,
                route = context.Request.Method + " " + context.Request.Path.Value
            };
        }

        // Lägg till extra info
        public static void Add(HttpContext context, object info)
        {
            if (!Globals.debugOn) { return; }
            var id = GetId(context);
            if (id == null || !memory.ContainsKey(id)) { return; }

            // Här kan du utöka LogItem om du vill lagra mer info
            // Just nu hoppar vi över "Obj" och håller det enkelt
        }

        // Skriv till konsolen och rensa
        public static async void Write()
        {
            if (!Globals.debugOn) { return; }
            while (true)
            {
                foreach (var key in memory.Keys)
                {
                    var item = memory[key];
                    if (item.RESPONSE_DONE != null || item.timestamp + 5000 < Now)
                    {
                        if (item.RESPONSE_DONE != null)
                        {
                            item.timeTakenMs = item.RESPONSE_DONE.Value - item.timestamp;
                            item.RESPONSE_DONE = null;
                        }

                        Log(item);
                        memory.TryRemove(key, out _);
                    }
                }
                await Task.Delay(500);
            }
        }

        // Enkel loggfunktion
        private static void Log(LogItem item)
        {
            Console.WriteLine($"[{item.time}] {item.route} tog {item.timeTakenMs} ms");
        }

        // Du verkar ha en "Now" variabel i Globals – annars kan du använda DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        private static long Now => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }
}
