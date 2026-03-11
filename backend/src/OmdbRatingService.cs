namespace WebApp;

public class OmdbRatingService
{
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;
    private readonly TimeSpan _cacheTtl = TimeSpan.FromHours(24);
    private readonly Dictionary<string, CacheEntry> _cache = new();
    private readonly object _lock = new();

    private sealed class CacheEntry
    {
        public string? Rating { get; set; }
        public DateTime ExpiresAtUtc { get; set; }
    }

    public OmdbRatingService(string apiKey, HttpClient? httpClient = null)
    {
        _apiKey = (apiKey ?? "").Trim();
        _httpClient = httpClient ?? new HttpClient { Timeout = TimeSpan.FromSeconds(5) };
    }

    public string? GetRating(string title, int? productionYear)
    {
        if (string.IsNullOrWhiteSpace(_apiKey) || string.IsNullOrWhiteSpace(title))
        {
            return null;
        }

        var cacheKey = BuildCacheKey(title, productionYear);

        lock (_lock)
        {
            if (_cache.TryGetValue(cacheKey, out var cached) && cached.ExpiresAtUtc > DateTime.UtcNow)
            {
                return cached.Rating;
            }
        }

        var rating = FetchRatingFromOmdb(title, productionYear);

        lock (_lock)
        {
            _cache[cacheKey] = new CacheEntry
            {
                Rating = rating,
                ExpiresAtUtc = DateTime.UtcNow.Add(_cacheTtl)
            };
        }

        return rating;
    }

    private static string BuildCacheKey(string title, int? productionYear)
    {
        return $"{title.Trim().ToLowerInvariant()}::{(productionYear?.ToString() ?? "")}";
    }

    private string? FetchRatingFromOmdb(string title, int? productionYear)
    {
        // 1) Try with production year when available for more precision.
        if (productionYear != null)
        {
            var ratingWithYear = FetchRatingByQuery(title, productionYear);
            if (!string.IsNullOrWhiteSpace(ratingWithYear))
            {
                return ratingWithYear;
            }
        }

        // 2) Fallback without year; useful when DB year differs from OMDb metadata.
        return FetchRatingByQuery(title, null);
    }

    private string? FetchRatingByQuery(string title, int? productionYear)
    {
        var url = $"https://www.omdbapi.com/?apikey={Uri.EscapeDataString(_apiKey)}&t={Uri.EscapeDataString(title)}&type=movie";
        if (productionYear != null)
        {
            url += $"&y={productionYear.Value}";
        }

        try
        {
            var json = _httpClient.GetStringAsync(url).GetAwaiter().GetResult();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (!root.TryGetProperty("Response", out var responseProp) || responseProp.GetString() != "True")
            {
                return null;
            }

            if (!root.TryGetProperty("imdbRating", out var ratingProp))
            {
                return null;
            }

            var rating = ratingProp.GetString();
            if (string.IsNullOrWhiteSpace(rating) || rating == "N/A")
            {
                return null;
            }

            return rating;
        }
        catch
        {
            return null;
        }
    }
}