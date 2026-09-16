using System.Security.Claims;
using GaneshChanda.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GaneshChanda.Api.Data;

public static class MainAdminNotifier
{
    public static async Task NotifyAsync(
        AppDbContext db,
        ClaimsPrincipal user,
        string kind,
        string details,
        string? faceImagePath = null)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(value, out var staffId))
        {
            return;
        }

        var staff = await db.StaffMembers.AsNoTracking().FirstOrDefaultAsync(s => s.Id == staffId);
        if (staff is null || StaffAccounts.IsMain(staff))
        {
            return;
        }

        db.LoginAlerts.Add(new LoginAlert
        {
            StaffMemberId = staff.Id,
            FaceImagePath = faceImagePath ?? string.Empty,
            CreatedAt = DateTime.UtcNow,
            IsRead = false,
            Kind = kind,
            Details = details
        });
        await db.SaveChangesAsync();
    }
}
