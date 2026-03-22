namespace WebApp;

using WebApp.Models;


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

            var bookingCode = Guid.NewGuid().ToString().Substring(0, 8);

            // Skapa bokningen
            var booking = SQLQueryOne(@"
        INSERT INTO bookings (userId, screeningId, bookingCode, status, created)
        VALUES (@userId, @screeningId, @bookingCode, 'confirmed', NOW());
        SELECT b.id, b.bookingCode, s.screeningDate, m.title
        FROM bookings b
        JOIN screenings s ON s.id = b.screeningId
        JOIN movies m ON m.id = s.movieId
        WHERE b.bookingCode = @bookingCode;
    ", new
            {
                userId = user.id,
                screeningId = req.ScreeningId,
                bookingCode
            });

            // Koppla platser
            req.SeatIds.ForEach(seatId =>
            {
                SQLQuery("INSERT INTO bookingSeats (bookingId, seatId) VALUES (@bookingId, @seatId)",
                    new { bookingId = booking.id, seatId });
            });

            var seatsLabel = req.SeatIds == null || req.SeatIds.Count == 0
                ? "-"
                : string.Join(", ", req.SeatIds);

            var pointsToAdd = (req.SeatIds == null ? 0 : req.SeatIds.Count) * 20;
            if (pointsToAdd > 0)
            {
                SQLQuery(
                    "UPDATE users SET points = IFNULL(points, 0) + @points WHERE id = @userId",
                    new { points = pointsToAdd, userId = user.id }
                );
                try
                {
                    var currentPoints = user.points == null ? 0 : Convert.ToInt32(user.points);
                    user.points = currentPoints + pointsToAdd;
                    Session.Set(context, "user", user);
                }
                catch { }
            }

            var safeTitle = System.Net.WebUtility.HtmlEncode(booking.title ?? "-");
            var safeDate = System.Net.WebUtility.HtmlEncode(booking.screeningDate?.ToString() ?? "-");
            var safeCode = System.Net.WebUtility.HtmlEncode(booking.bookingCode?.ToString() ?? "-");
            var safeSeats = System.Net.WebUtility.HtmlEncode(seatsLabel);
            var emailBody = $@"
<h1>Bokningsbekräftelse</h1>
<p><strong>Film:</strong> {safeTitle}</p>
<p><strong>Tid:</strong> {safeDate}</p>
<p><strong>Bokningskod:</strong> {safeCode}</p>
<p><strong>Stol:</strong> {safeSeats}</p>";
            EmailService.SendEmail(
                user.email,
                "Bokningsbekräftelse",
                emailBody
            );

            return RestResult.Parse(context, booking);
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
