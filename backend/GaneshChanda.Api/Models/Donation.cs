namespace GaneshChanda.Api.Models;

public class Donation
{
    public int Id { get; set; }
    public int DonorId { get; set; }
    public Donor Donor { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime DonationDate { get; set; }
    public string PaymentMethod { get; set; } = "UPI";
    public string Purpose { get; set; } = "Ganesh Utsav";
    public string ReceiptNumber { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
