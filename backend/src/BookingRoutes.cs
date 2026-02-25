namespace WebApp;

public static class BookingRoutes
{
    public static void Start()
    {
        App.MapGet("/bookings/me", (HttpContext context) =>
        {
            var user = Session.Get(context, "user");
            if (user == null)
            {
                return RestResult.Parse(context, new { error = "Not logged in." });
            }

            var sql = @"
                SELECT
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
    }
}
