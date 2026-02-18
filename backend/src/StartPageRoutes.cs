using System;
using System.Collections.Generic;
using MySqlConnector;

namespace WebApp
{
  public class Movie
  {
    public int Id { get; set; }
    public string Title { get; set; }
    public string Genre { get; set; }
    public int AgeRestriction { get; set; }
    public DateTime ScreeningDate { get; set; }

    public string? Image_url { get; set; }
  }

  public class MovieRepository
  {
    private readonly string _connectionString;

    public MovieRepository(string connectionString)
    {
      _connectionString = connectionString;
    }

    private MySqlConnection GetConnection() =>
        new MySqlConnection(_connectionString);

    // ── Base query used by all methods ────────────────────────────────────
    // Joins movies + screenings so we always have title, genre,
    // age_restriction and screeningDate available to work with.

    private const string BaseQuery = @"
            SELECT
                m.id,
                m.title,
                m.genre,
                m.age_restriction,
                s.screeningDate,
                m.image_url
            FROM movies m
            JOIN screenings s ON s.movieId = m.id";

    private List<Movie> ReadMovies(MySqlCommand cmd)
    {
      var list = new List<Movie>();
      using var reader = cmd.ExecuteReader();
      while (reader.Read())
      {
        list.Add(new Movie
        {
          Id = reader.GetInt32("id"),
          Title = reader.GetString("title"),
          Genre = reader.GetString("genre"),
          AgeRestriction = reader.GetInt32("age_restriction"),
          ScreeningDate = reader.GetDateTime("screeningDate"),
          // Image_url = reader.GetString("image_url")
          Image_url = reader.IsDBNull(reader.GetOrdinal("image_url")) ? null : reader.GetString("image_url")
        });
      }
      return list;
    }

    // ── 1. Get all movies (startpage) ─────────────────────────────────────

    public List<Movie> GetAll()
    {
      using var conn = GetConnection();
      conn.Open();
      using var cmd = new MySqlCommand(BaseQuery + " ORDER BY m.title", conn);
      return ReadMovies(cmd);
    }

    public Movie GetById(int id)
    {
      const string sql = BaseQuery + " WHERE m.id = @id";
      using var conn = GetConnection();
      conn.Open();
      using var cmd = new MySqlCommand(sql, conn);
      cmd.Parameters.AddWithValue("@id", id);
      var list = ReadMovies(cmd);
      return list.FirstOrDefault();
    }

    public List<string> GetGenres()
    {
      const string sql = @"
            SELECT DISTINCT m.genre
            FROM movies m
            JOIN screenings s ON s.movieId = m.id
            ORDER BY m.genre";

      using var conn = GetConnection();
      conn.Open();
      using var cmd = new MySqlCommand(sql, conn);
      using var reader = cmd.ExecuteReader();
      var genres = new List<string>();
      while (reader.Read())
      {
        genres.Add(reader.GetString("genre"));
      }
      return genres;
    }

    public List<int> GetAgeRestrictions()
    {
      const string sql = @"
            SELECT DISTINCT m.age_restriction
            FROM movies m
            JOIN screenings s ON s.movieId = m.id
            ORDER BY m.age_restriction";

      using var conn = GetConnection();
      conn.Open();
      using var cmd = new MySqlCommand(sql, conn);
      using var reader = cmd.ExecuteReader();
      var ages = new List<int>();
      while (reader.Read())
      {
        ages.Add(reader.GetInt32("age_restriction"));
      }
      return ages;
    }

    // ── 2. Search by title ────────────────────────────────────────────────

    public List<Movie> SearchByTitle(string title)
    {
      using var conn = GetConnection();
      conn.Open();
      using var cmd = new MySqlCommand(
          BaseQuery + " WHERE m.title LIKE @title ORDER BY m.title", conn);
      cmd.Parameters.AddWithValue("@title", $"%{title}%");
      return ReadMovies(cmd);
    }

    // ── 3. Filter by age, genre and/or date ───────────────────────────────
    // All three filters are optional — only applied when a value is passed in.

    public List<Movie> Filter(int? maxAge = null, string genre = null, DateTime? date = null)
    {
      var sql = BaseQuery + " WHERE 1=1";

      if (maxAge != null) sql += " AND m.age_restriction <= @age";
      if (genre != null) sql += " AND m.genre = @genre";
      if (date != null) sql += " AND DATE(s.screeningDate) = @date";

      sql += " ORDER BY s.screeningDate";

      using var conn = GetConnection();
      conn.Open();
      using var cmd = new MySqlCommand(sql, conn);

      if (maxAge != null) cmd.Parameters.AddWithValue("@age", maxAge);
      if (genre != null) cmd.Parameters.AddWithValue("@genre", genre);
      if (date != null) cmd.Parameters.AddWithValue("@date", date.Value.ToString("yyyy-MM-dd"));

      return ReadMovies(cmd);
    }
  }
}
