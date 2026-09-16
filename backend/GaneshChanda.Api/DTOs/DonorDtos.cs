using System.ComponentModel.DataAnnotations;

namespace GaneshChanda.Api.DTOs;

public class DonorDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int DonationCount { get; set; }
    public decimal TotalDonated { get; set; }
}

public class DonorWriteDto
{
    [Required, StringLength(120, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(160)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(20, MinimumLength = 8)]
    public string Phone { get; set; } = string.Empty;

    [StringLength(200)]
    public string Address { get; set; } = string.Empty;

    [StringLength(80)]
    public string City { get; set; } = string.Empty;

    [StringLength(80)]
    public string State { get; set; } = string.Empty;

    [StringLength(12)]
    public string Pincode { get; set; } = string.Empty;
}
