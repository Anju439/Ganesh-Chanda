using GaneshChanda.Api.Data;
using GaneshChanda.Api.DTOs;
using GaneshChanda.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GaneshChanda.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DonationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public DonationsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DonationDto>>> GetAll([FromQuery] int? donorId, [FromQuery] string? purpose)
    {
        var query = _db.Donations.AsNoTracking().Include(d => d.Donor).AsQueryable();

        if (donorId is not null)
        {
            query = query.Where(d => d.DonorId == donorId);
        }

        if (!string.IsNullOrWhiteSpace(purpose))
        {
            query = query.Where(d => d.Purpose == purpose);
        }

        var items = await query
            .OrderByDescending(d => d.DonationDate)
            .ThenByDescending(d => d.Id)
            .ToListAsync();

        return Ok(items.Select(Map));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DonationDto>> GetById(int id)
    {
        var donation = await _db.Donations.AsNoTracking()
            .Include(d => d.Donor)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (donation is null)
        {
            return NotFound();
        }

        return Ok(Map(donation));
    }

    [HttpPost]
    public async Task<ActionResult<DonationDto>> Create(DonationWriteDto input)
    {
        var donor = await _db.Donors.FindAsync(input.DonorId);
        if (donor is null)
        {
            return BadRequest(new { message = "Select a registered donor before recording a gift." });
        }

        var year = DateTime.UtcNow.Year;
        var lastReceipt = await _db.Donations
            .Where(d => d.ReceiptNumber.StartsWith($"GC-{year}-"))
            .OrderByDescending(d => d.ReceiptNumber)
            .Select(d => d.ReceiptNumber)
            .FirstOrDefaultAsync();

        var next = 1;
        if (lastReceipt is not null && int.TryParse(lastReceipt.Split('-').Last(), out var parsed))
        {
            next = parsed + 1;
        }

        var donation = new Donation
        {
            DonorId = input.DonorId,
            Amount = decimal.Round(input.Amount, 2),
            DonationDate = input.DonationDate.Date,
            PaymentMethod = input.PaymentMethod.Trim(),
            Purpose = input.Purpose.Trim(),
            Notes = input.Notes.Trim(),
            ReceiptNumber = $"GC-{year}-{next:D4}",
            CreatedAt = DateTime.UtcNow
        };

        _db.Donations.Add(donation);
        await _db.SaveChangesAsync();
        await MainAdminNotifier.NotifyAsync(
            _db,
            User,
            "DonationRecord",
            $"Donation {donation.ReceiptNumber} of {donation.Amount:0} for {donor.FullName} was recorded.");

        donation.Donor = donor;
        return CreatedAtAction(nameof(GetById), new { id = donation.Id }, Map(donation));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var donation = await _db.Donations.FindAsync(id);
        if (donation is null)
        {
            return NotFound();
        }

        _db.Donations.Remove(donation);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static DonationDto Map(Donation d) => new()
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
    };
}
