using System.ComponentModel.DataAnnotations;

namespace GaneshChanda.Api.DTOs;

public class DonationDto
{
    public int Id { get; set; }
    public int DonorId { get; set; }
    public string DonorName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DonationDate { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public string ReceiptNumber { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class DonationWriteDto
{
    [Required]
    public int DonorId { get; set; }

    [Required, Range(1, 10_000_000)]
    public decimal Amount { get; set; }

    [Required]
    public DateTime DonationDate { get; set; }

    [Required, StringLength(40)]
    public string PaymentMethod { get; set; } = "UPI";

    [Required, StringLength(80)]
    public string Purpose { get; set; } = "Ganesh Utsav";

    [StringLength(400)]
    public string Notes { get; set; } = string.Empty;
}
