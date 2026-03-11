namespace WebApp;

public static class BookingRoutes
{
    public static void Start()
    {
        // Ensure ACL rule exists for booking routes (user/admin)
        SQLQuery(
            @"INSERT IGNORE INTO acl (userRoles, method, allow, route, `match`, comment)
              VALUES ('user, admin', '*', 'allow', '/bookings', 'true', 'Allow users to manage their bookings')"
        );
        Acl.UnpackRules(SQLQuery("SELECT * FROM acl ORDER BY allow"));

        App.MapGet("/bookings/me", (HttpContext context) =>
        {
            var user = Session.Get(context, "user");
            if (user == null)
            {
                return RestResult.Parse(context, new { error = "Not logged in." });
            }

            var sql = @"SELECT 
                    b.id,
                    b.bookingCode,
                    b.screeningId,
                    b.totalPrice,
                    b.created,
                    b.status,
                    s.screeningDate,
                    s.screeningTime,
                    s.salonId,
                    sa.name AS salonName,
                    m.title,
                    m.image_url,
                    GROUP_CONCAT(
                        CONCAT(se.rowNumber, '-', se.seatNumber)
                        ORDER BY se.rowNumber, se.seatNumber
                        SEPARATOR ','
                    ) AS seats
                FROM bookings b
                JOIN screenings s ON s.id = b.screeningId
                JOIN salons sa ON sa.id = s.salonId
                JOIN movies m ON m.id = s.movieId
                LEFT JOIN bookingSeats bs ON bs.bookingId = b.id
                LEFT JOIN seats se ON se.id = bs.seatId
                WHERE b.userId = @userId
                GROUP BY b.id
                ORDER BY b.created DESC";

            return RestResult.Parse(
                context,
                SQLQuery(sql, new { userId = user.id }, context)
            );
        });

        App.MapPost("/bookings", (HttpContext context, BookingRequest req) =>
{
    var user = Session.Get(context, "user");
    if (user == null)
    {
        return RestResult.Parse(context, new { error = "Not logged in." });
    }

    // 1. Skapa bokningen i databasen
    var booking = SQLQueryOne(@"
        INSERT INTO bookings (userId, screeningId, bookingCode, status, created)
        VALUES (@userId, @screeningId, @bookingCode, 'confirmed', NOW());
        SELECT * FROM bookings WHERE bookingCode = @bookingCode;
    ", new
    {
        userId = user.id,
        screeningId = req.ScreeningId,
        bookingCode = Guid.NewGuid().ToString().Substring(0, 8)
    });

    App.MapDelete("/bookings/{id}/cancel", (HttpContext context, int id) =>
        {
            var user = Session.Get(context, "user");
            if (user == null)
            {
                return RestResult.Parse(context, new { error = "Not logged in." });
            }

            var booking = SQLQueryOne(
                "SELECT * FROM bookings WHERE id = @id AND userId = @userId",
                new { id, userId = user.id }
            );
            if (booking == null)
            {
                return RestResult.Parse(context, new { error = "Not found." });
            }

            // Release seats and mark booking as cancelled
            SQLQuery("DELETE FROM bookingSeats WHERE bookingId = @id", new { id });
            SQLQuery("DELETE FROM bookingTicketTypes WHERE bookingId = @id", new { id });
            SQLQuery("UPDATE bookings SET status = 'cancelled' WHERE id = @id", new { id });

            return RestResult.Parse(context, new { status = "Cancelled." });
        });
}

}
