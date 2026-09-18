using GaneshChanda.Api.Data;
using GaneshChanda.Api.DTOs;
using GaneshChanda.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GaneshChanda.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DonorsController : ControllerBase
{
    private readonly AppDbContext _db;

    public DonorsController(AppDbContext db)
    {
        _db = db;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DonorDto>>> GetAll([FromQuery] string? search)
    {
        var query = _db.Donors.AsNoTracking().Include(d => d.Donations).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(d =>
                d.FullName.Contains(term) ||
                d.Email.Contains(term) ||
                d.Phone.Contains(term) ||
                d.City.Contains(term));
        }

        var donors = await query
            .OrderBy(d => d.FullName)
            .ToListAsync();

        return Ok(donors.Select(d => Map(d, User.Identity?.IsAuthenticated == true)));
    }

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<DonorDto>> GetById(int id)
    {
        var donor = await _db.Donors.AsNoTracking()
            .Include(d => d.Donations)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (donor is null)
        {
            return NotFound();
        }

        return Ok(Map(donor, User.Identity?.IsAuthenticated == true));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<DonorDto>> Create(DonorWriteDto input)
    {
        if (await _db.Donors.AnyAsync(d => d.Email == input.Email))
        {
            return Conflict(new { message = "A donor with this email is already registered." });
        }

        var donor = new Donor
        {
            FullName = input.FullName.Trim(),
            Email = input.Email.Trim(),
            Phone = input.Phone.Trim(),
            Address = input.Address.Trim(),
            City = input.City.Trim(),
            State = input.State.Trim(),
            Pincode = input.Pincode.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.Donors.Add(donor);
        await _db.SaveChangesAsync();
        await MainAdminNotifier.NotifyAsync(
            _db,
            User,
            "DonorRegister",
            $"Donor {donor.FullName} ({donor.Phone}, {donor.City}) was registered.");

        return CreatedAtAction(nameof(GetById), new { id = donor.Id }, Map(donor, true));
    }


    [Authorize]
    [HttpPost("register-with-donation")]
    public async Task<ActionResult<DonorDto>> RegisterWithDonation(DonorRegistrationDto input)
    {
        if (await _db.Donors.AnyAsync(d => d.Email == input.Email))
        {
            return Conflict(new { message = "A donor with this email is already registered." });
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();
        var donor = new Donor
        {
            FullName = input.FullName.Trim(),
            Email = input.Email.Trim(),
            Phone = input.Phone.Trim(),
            Address = input.Address.Trim(),
            City = input.City.Trim(),
            State = input.State.Trim(),
            Pincode = input.Pincode.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        _db.Donors.Add(donor);
        await _db.SaveChangesAsync();

        var year = DateTime.UtcNow.Year;
        var lastReceipt = await _db.Donations
            .Where(d => d.ReceiptNumber.StartsWith($"GC-{year}-"))
            .OrderByDescending(d => d.ReceiptNumber)
            .Select(d => d.ReceiptNumber)
            .FirstOrDefaultAsync();
        var next = 1;
        if (lastReceipt is not null && int.TryParse(lastReceipt.Split('-').Last(), out var parsed)) next = parsed + 1;

        donor.Donations.Add(new Donation
        {
            DonorId = donor.Id,
            Amount = decimal.Round(input.Amount, 2),
            DonationDate = input.DonationDate.Date,
            PaymentMethod = input.PaymentMethod.Trim(),
            Purpose = input.Purpose.Trim(),
            Notes = input.Notes.Trim(),
            ReceiptNumber = $"GC-{year}-{next:D4}",
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        await MainAdminNotifier.NotifyAsync(_db, User, "DonorRegister",
            $"Donor {donor.FullName} was registered with an opening donation of {input.Amount:0}.");

        return CreatedAtAction(nameof(GetById), new { id = donor.Id }, Map(donor, true));
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<DonorDto>> Update(int id, DonorWriteDto input)
    {
        var donor = await _db.Donors.Include(d => d.Donations).FirstOrDefaultAsync(d => d.Id == id);
        if (donor is null)
        {
            return NotFound();
        }

        if (await _db.Donors.AnyAsync(d => d.Email == input.Email && d.Id != id))
        {
            return Conflict(new { message = "A donor with this email is already registered." });
        }

        donor.FullName = input.FullName.Trim();
        donor.Email = input.Email.Trim();
        donor.Phone = input.Phone.Trim();
        donor.Address = input.Address.Trim();
        donor.City = input.City.Trim();
        donor.State = input.State.Trim();
        donor.Pincode = input.Pincode.Trim();

        await _db.SaveChangesAsync();
        return Ok(Map(donor, true));
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var donor = await _db.Donors.Include(d => d.Donations).FirstOrDefaultAsync(d => d.Id == id);
        if (donor is null)
        {
            return NotFound();
        }

        if (donor.Donations.Count > 0)
        {
            return BadRequest(new { message = "This donor has recorded gifts. Remove those donations before deleting the donor." });
        }

        _db.Donors.Remove(donor);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static DonorDto Map(Donor d, bool includePrivate) => new()
    {
        Id = d.Id,
        FullName = d.FullName,
        Email = includePrivate ? d.Email : "",
        Phone = includePrivate ? d.Phone : "",
        Address = includePrivate ? d.Address : "",
        City = d.City,
        State = d.State,
        Pincode = includePrivate ? d.Pincode : "",
        CreatedAt = d.CreatedAt,
        DonationCount = d.Donations.Count,
        TotalDonated = d.Donations.Sum(x => x.Amount),
        LastDonationDate = d.Donations.Count == 0 ? null : d.Donations.Max(x => x.DonationDate)
    };
}
