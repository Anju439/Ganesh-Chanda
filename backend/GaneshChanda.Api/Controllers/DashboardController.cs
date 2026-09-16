using GaneshChanda.Api.Data;
using GaneshChanda.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GaneshChanda.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get()
    {
        var donations = await _db.Donations.AsNoTracking().Include(d => d.Donor).ToListAsync();
        var donorCount = await _db.Donors.CountAsync();
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1);

        var total = donations.Sum(d => d.Amount);
        var thisMonth = donations.Where(d => d.DonationDate >= monthStart).Sum(d => d.Amount);

        var byMethod = donations
            .GroupBy(d => d.PaymentMethod)
            .Select(g => new NamedTotalDto { Name = g.Key, Total = g.Sum(x => x.Amount), Count = g.Count() })
            .OrderByDescending(x => x.Total)
            .ToList();

        var byPurpose = donations
            .GroupBy(d => d.Purpose)
            .Select(g => new NamedTotalDto { Name = g.Key, Total = g.Sum(x => x.Amount), Count = g.Count() })
            .OrderByDescending(x => x.Total)
            .ToList();

        var monthly = Enumerable.Range(0, 6)
            .Select(offset =>
            {
                var start = monthStart.AddMonths(-5 + offset);
                var end = start.AddMonths(1);
                return new MonthlyTotalDto
                {
                    Month = start.ToString("MMM yyyy"),
                    Total = donations.Where(d => d.DonationDate >= start && d.DonationDate < end).Sum(d => d.Amount)
                };
            })
            .ToList();

        var recent = donations
            .OrderByDescending(d => d.DonationDate)
            .ThenByDescending(d => d.Id)
            .Take(8)
            .Select(d => new DonationDto
            {
                Id = d.Id,
                DonorId = d.DonorId,
                DonorName = d.Donor.FullName,
                Amount = d.Amount,
                DonationDate = d.DonationDate,
                PaymentMethod = d.PaymentMethod,
                Purpose = d.Purpose,
                ReceiptNumber = d.ReceiptNumber,
                Notes = d.Notes,
                CreatedAt = d.CreatedAt
            })
            .ToList();

        var topDonors = donations
            .GroupBy(d => new { d.DonorId, d.Donor.FullName })
            .Select(g => new TopDonorDto
            {
                DonorId = g.Key.DonorId,
                FullName = g.Key.FullName,
                TotalDonated = g.Sum(x => x.Amount),
                GiftCount = g.Count()
            })
            .OrderByDescending(x => x.TotalDonated)
            .Take(5)
            .ToList();

        return Ok(new DashboardDto
        {
            TotalRaised = total,
            DonorCount = donorCount,
            DonationCount = donations.Count,
            ThisMonthTotal = thisMonth,
            AverageGift = donations.Count == 0 ? 0 : decimal.Round(total / donations.Count, 2),
            ByPaymentMethod = byMethod,
            ByPurpose = byPurpose,
            MonthlyTrend = monthly,
            RecentDonations = recent,
            TopDonors = topDonors
        });
    }
}
