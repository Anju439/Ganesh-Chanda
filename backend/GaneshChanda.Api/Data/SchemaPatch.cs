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

        await db.Database.ExecuteSqlRawAsync("""
            IF OBJECT_ID(N'dbo.PendingLogins', N'U') IS NULL
            BEGIN
                CREATE TABLE dbo.PendingLogins (
                    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    StaffMemberId INT NOT NULL,
                    Token NVARCHAR(64) NOT NULL,
                    ExpiresAt DATETIME2 NOT NULL,
                    Completed BIT NOT NULL,
                    CONSTRAINT FK_PendingLogins_StaffMembers FOREIGN KEY (StaffMemberId)
                        REFERENCES dbo.StaffMembers(Id)
                );
                CREATE UNIQUE INDEX IX_PendingLogins_Token ON dbo.PendingLogins(Token);
            END
            """);

        await db.Database.ExecuteSqlRawAsync("""
            IF OBJECT_ID(N'dbo.LoginAlerts', N'U') IS NULL
            BEGIN
                CREATE TABLE dbo.LoginAlerts (
                    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    StaffMemberId INT NOT NULL,
                    FaceImagePath NVARCHAR(260) NULL,
                    CreatedAt DATETIME2 NOT NULL,
                    IsRead BIT NOT NULL,
                    Kind NVARCHAR(40) NOT NULL,
                    Details NVARCHAR(500) NOT NULL,
                    CONSTRAINT FK_LoginAlerts_StaffMembers FOREIGN KEY (StaffMemberId)
                        REFERENCES dbo.StaffMembers(Id)
                );
            END
            """);

        await db.Database.ExecuteSqlRawAsync("""
            IF OBJECT_ID(N'dbo.LoginAlerts', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.LoginAlerts', N'Kind') IS NULL
            BEGIN
                ALTER TABLE dbo.LoginAlerts ADD Kind NVARCHAR(40) NOT NULL CONSTRAINT DF_LoginAlerts_Kind DEFAULT 'FaceLogin';
                ALTER TABLE dbo.LoginAlerts ADD Details NVARCHAR(500) NOT NULL CONSTRAINT DF_LoginAlerts_Details DEFAULT '';
            END
            """);
    }
}
