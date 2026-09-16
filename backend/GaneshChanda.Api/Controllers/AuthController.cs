using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GaneshChanda.Api.Data;
using GaneshChanda.Api.DTOs;
using GaneshChanda.Api.Models;
using GaneshChanda.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace GaneshChanda.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;
    private readonly PasswordHasher<StaffMember> _hasher = new();

    public AuthController(AppDbContext db, IConfiguration config, IWebHostEnvironment env)
    {
        _db = db;
        _config = config;
        _env = env;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var username = request.Username.Trim();
        var password = request.Password.Trim();
        var staff = await _db.StaffMembers
            .FirstOrDefaultAsync(s => s.Username.ToLower() == username.ToLower());
        if (staff is null || !staff.IsActive)
        {
            return Unauthorized(new { message = "This person is not on the authorized staff list. Use username admin or clerk — not an email address." });
        }

        var passwordResult = _hasher.VerifyHashedPassword(staff, staff.PasswordHash, password);
        var demoPasswordMatches =
            (staff.Username.Equals(StaffAccounts.AdminUsername, StringComparison.OrdinalIgnoreCase)
             && password.Equals(StaffAccounts.AdminPassword, StringComparison.OrdinalIgnoreCase))
            || (staff.Username.Equals(StaffAccounts.ClerkUsername, StringComparison.OrdinalIgnoreCase)
                && password.Equals(StaffAccounts.ClerkPassword, StringComparison.OrdinalIgnoreCase));
        if (passwordResult == PasswordVerificationResult.Failed && !demoPasswordMatches)
        {
            return Unauthorized(new { message = "That password does not match this staff account. For the demo use Chanda@2026 with admin, or Clerk@2026 with clerk." });
        }

        string facePath;
        try
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            facePath = FaceImageStorage.Save(webRoot, request.FaceImage);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        _db.LoginAudits.Add(new LoginAudit
        {
            StaffMemberId = staff.Id,
            LoggedInAt = DateTime.UtcNow,
            FaceImagePath = facePath,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
        });
        await _db.SaveChangesAsync();

        return Ok(new LoginResponse
        {
            Token = CreateToken(staff),
            Staff = Map(staff)
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<StaffDto>> Me()
    {
        var id = UserId();
        if (id is null)
        {
            return Unauthorized();
        }

        var staff = await _db.StaffMembers.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
        if (staff is null || !staff.IsActive)
        {
            return Unauthorized();
        }

        return Ok(Map(staff));
    }

    [Authorize]
    [HttpGet("logins")]
    public async Task<ActionResult<IEnumerable<LoginAuditDto>>> Logins()
    {
        var rows = await _db.LoginAudits.AsNoTracking()
            .Include(l => l.StaffMember)
            .OrderByDescending(l => l.LoggedInAt)
            .Take(50)
            .ToListAsync();

        return Ok(rows.Select(l => new LoginAuditDto
        {
            Id = l.Id,
            StaffMemberId = l.StaffMemberId,
            FullName = l.StaffMember.FullName,
            Username = l.StaffMember.Username,
            LoggedInAt = l.LoggedInAt,
            FaceImageUrl = l.FaceImagePath
        }));
    }

    private int? UserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var id) ? id : null;
    }

    private string CreateToken(StaffMember staff)
    {
        var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is missing.");
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, staff.Id.ToString()),
            new Claim(ClaimTypes.Name, staff.Username),
            new Claim(ClaimTypes.GivenName, staff.FullName),
            new Claim(ClaimTypes.Role, staff.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static StaffDto Map(StaffMember staff) => new()
    {
        Id = staff.Id,
        Username = staff.Username,
        FullName = staff.FullName,
        Role = staff.Role
    };
}
