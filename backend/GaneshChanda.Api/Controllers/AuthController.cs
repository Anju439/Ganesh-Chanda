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
    public async Task<ActionResult<PendingLoginResponse>> Login(LoginRequest request)
    {
        var username = request.Username.Trim();
        var password = request.Password.Trim();
        var staff = await _db.StaffMembers
            .FirstOrDefaultAsync(s => s.Username.ToLower() == username.ToLower());
        if (staff is null || !staff.IsActive)
        {
            return Unauthorized(new { message = "This person is not on the authorized list. Use admin, admin1, admin2, admin3, admin4, or admin5." });
        }

        var passwordOk = _hasher.VerifyHashedPassword(staff, staff.PasswordHash, password) != PasswordVerificationResult.Failed
            || StaffAccounts.PasswordMatches(username, password);
        if (!passwordOk)
        {
            return Unauthorized(new { message = "That password does not match this staff account." });
        }

        // Main Admin signs in with credentials only. Staff accounts must capture a face photo.
        if (StaffAccounts.IsMain(staff))
        {
            _db.LoginAudits.Add(new LoginAudit
            {
                StaffMemberId = staff.Id,
                LoggedInAt = DateTime.UtcNow,
                FaceImagePath = string.Empty,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
            });
            await _db.SaveChangesAsync();

            return Ok(new PendingLoginResponse
            {
                Token = CreateToken(staff),
                RequiresFace = false,
                NotifyMainAdmin = false,
                Staff = Map(staff)
            });
        }

        var pending = new PendingLogin
        {
            StaffMemberId = staff.Id,
            Token = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            Completed = false
        };
        _db.PendingLogins.Add(pending);
        await _db.SaveChangesAsync();

        return Ok(new PendingLoginResponse
        {
            PendingToken = pending.Token,
            RequiresFace = true,
            NotifyMainAdmin = true,
            Staff = Map(staff)
        });
    }

    [AllowAnonymous]
    [HttpPost("login/face")]
    public async Task<ActionResult<LoginResponse>> CompleteFace(FaceLoginRequest request)
    {
        var pending = await _db.PendingLogins
            .Include(p => p.StaffMember)
            .FirstOrDefaultAsync(p => p.Token == request.PendingToken);
        if (pending is null || pending.Completed || pending.ExpiresAt < DateTime.UtcNow)
        {
            return Unauthorized(new { message = "Sign-in expired. Enter your username and password again." });
        }

        var staff = pending.StaffMember;
        if (!staff.IsActive)
        {
            return Unauthorized(new { message = "This staff account is no longer active." });
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

        pending.Completed = true;
        _db.LoginAudits.Add(new LoginAudit
        {
            StaffMemberId = staff.Id,
            LoggedInAt = DateTime.UtcNow,
            FaceImagePath = facePath,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
        });

        var sentToMain = false;
        if (!StaffAccounts.IsMain(staff))
        {
            _db.LoginAlerts.Add(new LoginAlert
            {
                StaffMemberId = staff.Id,
                FaceImagePath = facePath,
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                Kind = "FaceLogin",
                Details = $"{staff.FullName} ({staff.Username}) signed in. Face photo sent to Main Admin."
            });
            sentToMain = true;
        }

        await _db.SaveChangesAsync();

        return Ok(new LoginResponse
        {
            Token = CreateToken(staff),
            Staff = Map(staff),
            SentToMainAdmin = sentToMain
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<StaffDto>> Me()
    {
        var staff = await CurrentStaff();
        if (staff is null)
        {
            return Unauthorized();
        }

        return Ok(Map(staff));
    }

    [Authorize]
    [HttpGet("logins")]
    public async Task<ActionResult<IEnumerable<LoginAuditDto>>> Logins()
    {
        var staff = await CurrentStaff();
        if (staff is null || !StaffAccounts.IsMain(staff))
        {
            return Forbid();
        }

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

    [Authorize]
    [HttpGet("alerts")]
    public async Task<ActionResult<IEnumerable<LoginAlertDto>>> Alerts()
    {
        var staff = await CurrentStaff();
        if (staff is null)
        {
            return Unauthorized();
        }

        if (!StaffAccounts.IsMain(staff))
        {
            return Forbid();
        }

        var rows = await _db.LoginAlerts.AsNoTracking()
            .Include(a => a.StaffMember)
            .OrderByDescending(a => a.CreatedAt)
            .Take(50)
            .ToListAsync();

        return Ok(rows.Select(MapAlert));
    }

    [Authorize]
    [HttpPost("alerts/{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var staff = await CurrentStaff();
        if (staff is null || !StaffAccounts.IsMain(staff))
        {
            return Forbid();
        }

        var alert = await _db.LoginAlerts.FindAsync(id);
        if (alert is null)
        {
            return NotFound();
        }

        alert.IsRead = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<StaffMember?> CurrentStaff()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(value, out var id))
        {
            return null;
        }

        var staff = await _db.StaffMembers.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
        return staff is { IsActive: true } ? staff : null;
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
        Role = staff.Role,
        IsMainAdmin = StaffAccounts.IsMain(staff)
    };

    private static LoginAlertDto MapAlert(LoginAlert alert) => new()
    {
        Id = alert.Id,
        StaffMemberId = alert.StaffMemberId,
        FullName = alert.StaffMember.FullName,
        Username = alert.StaffMember.Username,
        Role = alert.StaffMember.Role,
        Kind = alert.Kind,
        Details = alert.Details,
        CreatedAt = alert.CreatedAt,
        FaceImageUrl = alert.FaceImagePath,
        IsRead = alert.IsRead
    };
}
