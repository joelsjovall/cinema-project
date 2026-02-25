namespace WebApp;

public static class MovieRoutes
{
  static readonly Dictionary<int, int[]> SalonSeatLayouts = new()
  {
    { 1, new[] { 6, 8, 9, 10, 10, 12 } },
    { 2, new[] { 8, 9, 10, 10, 10, 10, 12, 12 } }
  };

  public class CreateBookingRequest
  {
    public int[]? selectedSeats { get; set; }
    public string? guestEmail { get; set; }
    public decimal totalPrice { get; set; }
  }

  static bool TryToRowSeat(int[] layout, int displaySeatNumber, out int rowNumber, out int seatNumberInRow)
  {
    rowNumber = 0;
    seatNumberInRow = 0;
    if (displaySeatNumber <= 0) return false;

    var cumulative = 0;
    for (var i = 0; i < layout.Length; i++)
    {
      var rowSeats = layout[i];
      if (displaySeatNumber <= cumulative + rowSeats)
      {
        rowNumber = i + 1;
        seatNumberInRow = displaySeatNumber - cumulative;
        return true;
      }
      cumulative += rowSeats;
    }
    return false;
  }

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

    // GET /movies/{id}/screenings
    App.MapGet("/movies/{id}/screenings", (HttpContext context, int id) =>
        RestResult.Parse(
            context,
            SQLQuery(
                "SELECT * FROM screenings WHERE movieId = @movieId ORDER BY screeningDate, screeningTime",
                Obj(new { movieId = id })
            )
        )
    );

    // GET /movies/screenings/{id}
    App.MapGet("/movies/screenings/{id}", (HttpContext context, int id) =>
        RestResult.Parse(
            context,
            SQLQueryOne(
                "SELECT * FROM screenings WHERE id = @id",
                Obj(new { id })
            )
        )
    );

    // GET /movies/search?title=avengers
    App.MapGet("/movies/search", (string title) => repo.SearchByTitle(title));

    // GET /movies/filter?maxAge=13&genre=Action&date=2025-06-01
    App.MapGet("/movies/filter", (int? maxAge, string? genre, DateTime? date) =>
        repo.Filter(maxAge, genre, date));

    App.MapGet("/movies/screenings/{id}/booked-seats", (HttpContext context, int id) =>
    {
      var screening = SQLQueryOne("SELECT salonId FROM screenings WHERE id = @id", Obj(new { id }));
      var salonId = screening?.salonId == null ? 0 : Convert.ToInt32(screening.salonId);
      int[] layout;
      if (!SalonSeatLayouts.TryGetValue(salonId, out layout))
      {
        return RestResult.Parse(context, Arr());
      }

      var rows = SQLQuery(
        @"SELECT DISTINCT
            CASE s.salonId
              WHEN 1 THEN
                (CASE s.rowNumber
                  WHEN 1 THEN s.seatNumber
                  WHEN 2 THEN 6 + s.seatNumber
                  WHEN 3 THEN 14 + s.seatNumber
                  WHEN 4 THEN 23 + s.seatNumber
                  WHEN 5 THEN 33 + s.seatNumber
                  WHEN 6 THEN 43 + s.seatNumber
                  ELSE s.seatNumber
                END)
              WHEN 2 THEN
                (CASE s.rowNumber
                  WHEN 1 THEN s.seatNumber
                  WHEN 2 THEN 8 + s.seatNumber
                  WHEN 3 THEN 17 + s.seatNumber
                  WHEN 4 THEN 27 + s.seatNumber
                  WHEN 5 THEN 37 + s.seatNumber
                  WHEN 6 THEN 47 + s.seatNumber
                  WHEN 7 THEN 57 + s.seatNumber
                  WHEN 8 THEN 69 + s.seatNumber
                  ELSE s.seatNumber
                END)
              ELSE s.seatNumber
            END AS seatNumber
          FROM bookings b
          JOIN bookingSeats bs ON bs.bookingId = b.id
          JOIN seats s ON s.id = bs.seatId
          WHERE b.screeningId = @screeningId
            AND (b.status IS NULL OR b.status NOT IN ('cancelled', 'canceled', 'avbokad'))
          ORDER BY seatNumber",
        Obj(new { screeningId = id })
      );
      return RestResult.Parse(context, rows);
    });

    App.MapPost("/movies/screenings/{id}/book", (HttpContext context, int id, JsonElement bodyJson) =>
    {
      var request = bodyJson.Deserialize<CreateBookingRequest>();
      var selectedSeatNumbers = (request?.selectedSeats ?? Array.Empty<int>())
        .Where(n => n > 0)
        .Distinct()
        .OrderBy(n => n)
        .ToArray();

      if (selectedSeatNumbers.Length == 0)
      {
        return RestResult.Parse(context, Obj(new { error = "No seats selected." }));
      }

      using var db = new MySqlConnection(connStr);
      db.Open();
      using var tx = db.BeginTransaction();

      try
      {
        var loggedInUser = Session.Get(context, "user");
        int? userIdToStore = null;
        var emailToStore = "";
        if (loggedInUser != null)
        {
          try
          {
            if (loggedInUser.id != null)
            {
              userIdToStore = Convert.ToInt32(loggedInUser.id);
            }
          }
          catch { }

          try
          {
            if (loggedInUser.email != null)
            {
              emailToStore = Convert.ToString(loggedInUser.email) ?? "";
            }
          }
          catch { }
        }

        if (string.IsNullOrWhiteSpace(emailToStore))
        {
          emailToStore = (request?.guestEmail ?? "").Trim();
        }

        if (string.IsNullOrWhiteSpace(emailToStore))
        {
          tx.Rollback();
          return RestResult.Parse(context, Obj(new { error = "Email is required." }));
        }

        var screeningCommand = db.CreateCommand();
        screeningCommand.Transaction = tx;
        screeningCommand.CommandText = "SELECT salonId FROM screenings WHERE id = @screeningId";
        screeningCommand.Parameters.AddWithValue("@screeningId", id);
        var screeningSalonId = screeningCommand.ExecuteScalar();
        if (screeningSalonId == null)
        {
          tx.Rollback();
          return RestResult.Parse(context, Obj(new { error = "Screening not found." }));
        }
        var salonId = Convert.ToInt32(screeningSalonId);
        int[] layout;
        if (!SalonSeatLayouts.TryGetValue(salonId, out layout))
        {
          tx.Rollback();
          return RestResult.Parse(context, Obj(new { error = "No seat layout for this salon." }));
        }

        var selectedSeatIds = new List<int>();
        foreach (var seatNumber in selectedSeatNumbers)
        {
          if (!TryToRowSeat(layout, seatNumber, out var rowNumber, out var seatNumberInRow))
          {
            tx.Rollback();
            return RestResult.Parse(context, Obj(new { error = $"Seat {seatNumber} does not exist for this screening." }));
          }

          var seatLookupCommand = db.CreateCommand();
          seatLookupCommand.Transaction = tx;
          seatLookupCommand.CommandText = @"
            SELECT id
            FROM seats
            WHERE salonId = @salonId
              AND rowNumber = @rowNumber
              AND seatNumber = @seatNumber
            LIMIT 1";
          seatLookupCommand.Parameters.AddWithValue("@salonId", salonId);
          seatLookupCommand.Parameters.AddWithValue("@rowNumber", rowNumber);
          seatLookupCommand.Parameters.AddWithValue("@seatNumber", seatNumberInRow);
          var existingSeatId = seatLookupCommand.ExecuteScalar();

          int seatId;
          if (existingSeatId == null)
          {
            var createSeatCommand = db.CreateCommand();
            createSeatCommand.Transaction = tx;
            createSeatCommand.CommandText = @"
              INSERT INTO seats (salonId, rowNumber, seatNumber)
              VALUES (@salonId, @rowNumber, @seatNumber)";
            createSeatCommand.Parameters.AddWithValue("@salonId", salonId);
            createSeatCommand.Parameters.AddWithValue("@rowNumber", rowNumber);
            createSeatCommand.Parameters.AddWithValue("@seatNumber", seatNumberInRow);
            createSeatCommand.ExecuteNonQuery();
            seatId = (int)createSeatCommand.LastInsertedId;
          }
          else
          {
            seatId = Convert.ToInt32(existingSeatId);
          }

          selectedSeatIds.Add(seatId);
        }

        var inParams = selectedSeatIds.Select((_, i) => $"@seatId{i}").ToArray();
        var occupiedCheckCommand = db.CreateCommand();
        occupiedCheckCommand.Transaction = tx;
        occupiedCheckCommand.CommandText = $@"
          SELECT COUNT(*) 
          FROM bookings b
          JOIN bookingSeats bs ON bs.bookingId = b.id
          WHERE b.screeningId = @screeningId
            AND (b.status IS NULL OR b.status NOT IN ('cancelled', 'canceled', 'avbokad'))
            AND bs.seatId IN ({string.Join(",", inParams)})";
        occupiedCheckCommand.Parameters.AddWithValue("@screeningId", id);
        for (var i = 0; i < selectedSeatIds.Count; i++)
        {
          occupiedCheckCommand.Parameters.AddWithValue($"@seatId{i}", selectedSeatIds[i]);
        }
        var occupiedCount = Convert.ToInt32(occupiedCheckCommand.ExecuteScalar());
        if (occupiedCount > 0)
        {
          tx.Rollback();
          return RestResult.Parse(context, Obj(new { error = "One or more selected seats are already booked." }));
        }

        var bookingCode = "B" + Random.Shared.Next(100000, 999999).ToString();
        var insertBookingCommand = db.CreateCommand();
        insertBookingCommand.Transaction = tx;
        insertBookingCommand.CommandText = @"
          INSERT INTO bookings (bookingCode, screeningId, userId, guestEmail, totalPrice, created, status)
          VALUES (@bookingCode, @screeningId, @userId, @guestEmail, @totalPrice, NOW(), 'confirmed')";
        insertBookingCommand.Parameters.AddWithValue("@bookingCode", bookingCode);
        insertBookingCommand.Parameters.AddWithValue("@screeningId", id);
        insertBookingCommand.Parameters.AddWithValue("@userId", userIdToStore == null ? DBNull.Value : userIdToStore);
        insertBookingCommand.Parameters.AddWithValue("@guestEmail", emailToStore);
        insertBookingCommand.Parameters.AddWithValue("@totalPrice", request?.totalPrice ?? 0);
        insertBookingCommand.ExecuteNonQuery();
        var bookingId = (int)insertBookingCommand.LastInsertedId;

        foreach (var seatId in selectedSeatIds)
        {
          var insertBookingSeatCommand = db.CreateCommand();
          insertBookingSeatCommand.Transaction = tx;
          insertBookingSeatCommand.CommandText =
            "INSERT INTO bookingSeats (bookingId, seatId) VALUES (@bookingId, @seatId)";
          insertBookingSeatCommand.Parameters.AddWithValue("@bookingId", bookingId);
          insertBookingSeatCommand.Parameters.AddWithValue("@seatId", seatId);
          insertBookingSeatCommand.ExecuteNonQuery();
        }

        tx.Commit();
        return RestResult.Parse(context, Obj(new
        {
          bookingId,
          bookingCode,
          bookedSeats = selectedSeatNumbers
        }));
      }
      catch (Exception ex)
      {
        tx.Rollback();
        return RestResult.Parse(context, Obj(new { error = ex.Message }));
      }
    });
  }
}
