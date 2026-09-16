namespace GaneshChanda.Api.DTOs;

public class DashboardDto
{
    public decimal TotalRaised { get; set; }
    public int DonorCount { get; set; }
    public int DonationCount { get; set; }
    public decimal ThisMonthTotal { get; set; }
    public decimal AverageGift { get; set; }
    public List<NamedTotalDto> ByPaymentMethod { get; set; } = new();
    public List<NamedTotalDto> ByPurpose { get; set; } = new();
    public List<MonthlyTotalDto> MonthlyTrend { get; set; } = new();
    public List<DonationDto> RecentDonations { get; set; } = new();
    public List<TopDonorDto> TopDonors { get; set; } = new();
}

public class NamedTotalDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public int Count { get; set; }
}

public class MonthlyTotalDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Total { get; set; }
}

public class TopDonorDto
{
    public int DonorId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public decimal TotalDonated { get; set; }
    public int GiftCount { get; set; }
}
