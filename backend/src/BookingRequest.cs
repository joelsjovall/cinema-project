namespace WebApp.Models
{
  public class BookingRequest
  {
    public int ScreeningId { get; set; }
    public List<int> SeatIds { get; set; } = new();
  }
}
