namespace WebApp;

public static class MovieRoutes
{
  static string connStr = "Server=5.189.183.23;Port=4567;Database=h25malmo-grupp3;User=h25malmo-grupp3;Password=XWLBR20607;";
  static MovieRepository repo = new MovieRepository(connStr);

  public static void Start()
  {
    // GET /movies
    App.MapGet("/movies", () => repo.GetAll());

    // GET /movies/options/genres
    App.MapGet("/movies/options/genres", () => repo.GetGenres());

    // GET /movies/options/ages
    App.MapGet("/movies/options/ages", () => repo.GetAgeRestrictions());

    App.MapGet("/movies/{id}", (int id) => repo.GetById(id));

    // GET /movies/search?title=avengers
    App.MapGet("/movies/search", (string title) => repo.SearchByTitle(title));

    // GET /movies/filter?maxAge=13&genre=Action&date=2025-06-01
    App.MapGet("/movies/filter", (int? maxAge, string? genre, DateTime? date) =>
        repo.Filter(maxAge, genre, date));
  }
}
