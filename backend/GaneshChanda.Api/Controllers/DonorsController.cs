using GaneshChanda.Api.Data;
using GaneshChanda.Api.DTOs;
using GaneshChanda.Api.Models;
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

        return Ok(donors.Select(Map));
    }

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

        return Ok(Map(donor));
    }

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

        return CreatedAtAction(nameof(GetById), new { id = donor.Id }, Map(donor));
    }

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
        return Ok(Map(donor));
    }

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

    private static DonorDto Map(Donor d) => new()
    {
        Id = d.Id,
        FullName = d.FullName,
        Email = d.Email,
        Phone = d.Phone,
        Address = d.Address,
        City = d.City,
        State = d.State,
        Pincode = d.Pincode,
        CreatedAt = d.CreatedAt,
        DonationCount = d.Donations.Count,
        TotalDonated = d.Donations.Sum(x => x.Amount)
    };
}
