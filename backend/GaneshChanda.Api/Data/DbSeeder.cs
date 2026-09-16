using GaneshChanda.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GaneshChanda.Api.Data;

public static class StaffAccounts
{
    public const string MainUsername = "admin";
    public const string MainPassword = "Chanda@2026";
    public const string MainRole = "MainAdmin";

    public static readonly StaffSeed[] Allowed =
    [
        new("admin", "Chanda@2026", "Main Admin", "MainAdmin"),
        new("admin1", "Admin1@2026", "Admin 1", "Admin1"),
        new("admin2", "Admin2@2026", "Admin 2", "Admin2"),
        new("admin3", "Admin3@2026", "Admin 3", "Admin3"),
        new("admin4", "Admin4@2026", "Admin 4", "Admin4"),
        new("admin5", "Admin5@2026", "Admin 5", "Admin5")
    ];

    public static bool IsMain(StaffMember staff) =>
        staff.Role.Equals(MainRole, StringComparison.OrdinalIgnoreCase)
        || staff.Username.Equals(MainUsername, StringComparison.OrdinalIgnoreCase);

    public static bool PasswordMatches(string username, string password) =>
        Allowed.Any(account =>
            account.Username.Equals(username, StringComparison.OrdinalIgnoreCase)
            && account.Password.Equals(password, StringComparison.OrdinalIgnoreCase));
}

public readonly record struct StaffSeed(string Username, string Password, string FullName, string Role);

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await SeedStaffAsync(db);

        if (await db.Donors.AnyAsync())
        {
            return;
        }

        var donors = new List<Donor>
        {
            new() { FullName = "Ramesh Kulkarni", Email = "ramesh.kulkarni@example.com", Phone = "9876501234", Address = "12 Tilak Road", City = "Pune", State = "Maharashtra", Pincode = "411002", CreatedAt = DateTime.UtcNow.AddDays(-80) },
            new() { FullName = "Sunita Deshmukh", Email = "sunita.deshmukh@example.com", Phone = "9822011122", Address = "45 FC Road", City = "Pune", State = "Maharashtra", Pincode = "411004", CreatedAt = DateTime.UtcNow.AddDays(-70) },
            new() { FullName = "Arjun Patel", Email = "arjun.patel@example.com", Phone = "9904412233", Address = "8 CG Road", City = "Ahmedabad", State = "Gujarat", Pincode = "380009", CreatedAt = DateTime.UtcNow.AddDays(-55) },
            new() { FullName = "Meera Iyer", Email = "meera.iyer@example.com", Phone = "9448019988", Address = "21 MG Road", City = "Bengaluru", State = "Karnataka", Pincode = "560001", CreatedAt = DateTime.UtcNow.AddDays(-40) },
            new() { FullName = "Vikram Joshi", Email = "vikram.joshi@example.com", Phone = "9811122233", Address = "3 Karol Bagh", City = "New Delhi", State = "Delhi", Pincode = "110005", CreatedAt = DateTime.UtcNow.AddDays(-30) },
            new() { FullName = "Anjali Nair", Email = "anjali.nair@example.com", Phone = "9847015566", Address = "17 Marine Drive", City = "Kochi", State = "Kerala", Pincode = "682031", CreatedAt = DateTime.UtcNow.AddDays(-20) },
            new() { FullName = "Sanjay Reddy", Email = "sanjay.reddy@example.com", Phone = "9000112233", Address = "9 Banjara Hills", City = "Hyderabad", State = "Telangana", Pincode = "500034", CreatedAt = DateTime.UtcNow.AddDays(-12) },
            new() { FullName = "Priya Sharma", Email = "priya.sharma@example.com", Phone = "9123456780", Address = "28 Law Garden", City = "Ahmedabad", State = "Gujarat", Pincode = "380006", CreatedAt = DateTime.UtcNow.AddDays(-6) }
        };

        db.Donors.AddRange(donors);
        await db.SaveChangesAsync();

        var donations = new List<Donation>
        {
            Gift(donors[0], 11000, -75, "UPI", "Ganesh Utsav", "First chanda for mandal"),
            Gift(donors[0], 5001, -18, "Cash", "Annadanam", "Prasad for visarjan day"),
            Gift(donors[1], 21000, -60, "Bank Transfer", "Ganesh Utsav", "Main pandal sponsorship"),
            Gift(donors[1], 2500, -8, "UPI", "Temple Maintenance", ""),
            Gift(donors[2], 51000, -45, "Cheque", "Ganesh Utsav", "Idol and decoration"),
            Gift(donors[2], 3000, -10, "UPI", "General Fund", ""),
            Gift(donors[3], 7500, -32, "UPI", "Cultural Programs", "Bhajan evening"),
            Gift(donors[4], 11000, -22, "Card", "Ganesh Utsav", ""),
            Gift(donors[4], 1500, -4, "Cash", "Annadanam", ""),
            Gift(donors[5], 2100, -14, "UPI", "General Fund", "Monthly offering"),
            Gift(donors[5], 501, -2, "UPI", "Temple Maintenance", ""),
            Gift(donors[6], 25000, -9, "Bank Transfer", "Ganesh Utsav", "Sound system"),
            Gift(donors[7], 11000, -3, "UPI", "Ganesh Utsav", "New donor welcome gift"),
            Gift(donors[7], 2100, -1, "Cash", "Annadanam", "")
        };

        for (var i = 0; i < donations.Count; i++)
        {
            donations[i].ReceiptNumber = $"GC-{DateTime.UtcNow.Year}-{(i + 1):D4}";
        }

        db.Donations.AddRange(donations);
        await db.SaveChangesAsync();
    }

    private static async Task SeedStaffAsync(AppDbContext db)
    {
        var hasher = new PasswordHasher<StaffMember>();
        var allowedNames = StaffAccounts.Allowed.Select(a => a.Username.ToLower()).ToHashSet();

        foreach (var account in StaffAccounts.Allowed)
        {
            await UpsertStaffAsync(db, hasher, account);
        }

        var extras = await db.StaffMembers
            .Where(s => !allowedNames.Contains(s.Username.ToLower()))
            .ToListAsync();
        foreach (var extra in extras)
        {
            extra.IsActive = false;
        }

        await db.SaveChangesAsync();
    }

    private static async Task UpsertStaffAsync(AppDbContext db, PasswordHasher<StaffMember> hasher, StaffSeed account)
    {
        var staff = await db.StaffMembers.FirstOrDefaultAsync(s => s.Username == account.Username);
        if (staff is null)
        {
            staff = new StaffMember
            {
                Username = account.Username,
                FullName = account.FullName,
                Role = account.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            staff.PasswordHash = hasher.HashPassword(staff, account.Password);
            db.StaffMembers.Add(staff);
            return;
        }

        staff.FullName = account.FullName;
        staff.Role = account.Role;
        staff.IsActive = true;
        if (hasher.VerifyHashedPassword(staff, staff.PasswordHash, account.Password) == PasswordVerificationResult.Failed)
        {
            staff.PasswordHash = hasher.HashPassword(staff, account.Password);
        }
    }

    private static Donation Gift(Donor donor, decimal amount, int daysAgo, string method, string purpose, string notes)
    {
        return new Donation
        {
            Donor = donor,
            Amount = amount,
            DonationDate = DateTime.UtcNow.Date.AddDays(daysAgo),
            PaymentMethod = method,
            Purpose = purpose,
            Notes = notes,
            CreatedAt = DateTime.UtcNow.AddDays(daysAgo)
        };
    }
}
