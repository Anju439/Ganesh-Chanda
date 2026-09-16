using Microsoft.EntityFrameworkCore;

namespace GaneshChanda.Api.Data;

public static class SchemaPatch
{
    public static async Task ApplyAsync(AppDbContext db)
    {
        await db.Database.ExecuteSqlRawAsync("""
            IF OBJECT_ID(N'dbo.StaffMembers', N'U') IS NULL
            BEGIN
                CREATE TABLE dbo.StaffMembers (
                    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    Username NVARCHAR(80) NOT NULL,
                    PasswordHash NVARCHAR(500) NOT NULL,
                    FullName NVARCHAR(120) NOT NULL,
                    Role NVARCHAR(40) NOT NULL,
                    IsActive BIT NOT NULL,
                    CreatedAt DATETIME2 NOT NULL
                );
                CREATE UNIQUE INDEX IX_StaffMembers_Username ON dbo.StaffMembers(Username);
            END
            """);

        await db.Database.ExecuteSqlRawAsync("""
            IF OBJECT_ID(N'dbo.LoginAudits', N'U') IS NULL
            BEGIN
                CREATE TABLE dbo.LoginAudits (
                    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    StaffMemberId INT NOT NULL,
                    LoggedInAt DATETIME2 NOT NULL,
                    FaceImagePath NVARCHAR(260) NOT NULL,
                    IpAddress NVARCHAR(64) NULL,
                    CONSTRAINT FK_LoginAudits_StaffMembers FOREIGN KEY (StaffMemberId)
                        REFERENCES dbo.StaffMembers(Id)
                );
            END
            """);
    }
}
