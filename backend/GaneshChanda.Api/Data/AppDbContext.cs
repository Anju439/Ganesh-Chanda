using GaneshChanda.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GaneshChanda.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Donor> Donors => Set<Donor>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<StaffMember> StaffMembers => Set<StaffMember>();
    public DbSet<LoginAudit> LoginAudits => Set<LoginAudit>();
    public DbSet<PendingLogin> PendingLogins => Set<PendingLogin>();
    public DbSet<LoginAlert> LoginAlerts => Set<LoginAlert>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Donor>(entity =>
        {
            entity.ToTable("Donors");
            entity.HasKey(d => d.Id);
            entity.Property(d => d.FullName).HasMaxLength(120).IsRequired();
            entity.Property(d => d.Email).HasMaxLength(160).IsRequired();
            entity.Property(d => d.Phone).HasMaxLength(20).IsRequired();
            entity.Property(d => d.Address).HasMaxLength(200);
            entity.Property(d => d.City).HasMaxLength(80);
            entity.Property(d => d.State).HasMaxLength(80);
            entity.Property(d => d.Pincode).HasMaxLength(12);
            entity.HasIndex(d => d.Email).IsUnique();
        });

        modelBuilder.Entity<Donation>(entity =>
        {
            entity.ToTable("Donations");
            entity.HasKey(d => d.Id);
            entity.Property(d => d.Amount).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(d => d.PaymentMethod).HasMaxLength(40).IsRequired();
            entity.Property(d => d.Purpose).HasMaxLength(80).IsRequired();
            entity.Property(d => d.ReceiptNumber).HasMaxLength(32).IsRequired();
            entity.Property(d => d.Notes).HasMaxLength(400);
            entity.HasIndex(d => d.ReceiptNumber).IsUnique();
            entity.HasOne(d => d.Donor)
                .WithMany(p => p.Donations)
                .HasForeignKey(d => d.DonorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<StaffMember>(entity =>
        {
            entity.ToTable("StaffMembers");
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Username).HasMaxLength(80).IsRequired();
            entity.Property(s => s.PasswordHash).HasMaxLength(500).IsRequired();
            entity.Property(s => s.FullName).HasMaxLength(120).IsRequired();
            entity.Property(s => s.Role).HasMaxLength(40).IsRequired();
            entity.HasIndex(s => s.Username).IsUnique();
        });

        modelBuilder.Entity<LoginAudit>(entity =>
        {
            entity.ToTable("LoginAudits");
            entity.HasKey(l => l.Id);
            entity.Property(l => l.FaceImagePath).HasMaxLength(260).IsRequired();
            entity.Property(l => l.IpAddress).HasMaxLength(64);
            entity.HasOne(l => l.StaffMember)
                .WithMany(s => s.LoginAudits)
                .HasForeignKey(l => l.StaffMemberId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PendingLogin>(entity =>
        {
            entity.ToTable("PendingLogins");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Token).HasMaxLength(64).IsRequired();
            entity.HasIndex(p => p.Token).IsUnique();
            entity.HasOne(p => p.StaffMember)
                .WithMany()
                .HasForeignKey(p => p.StaffMemberId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<LoginAlert>(entity =>
        {
            entity.ToTable("LoginAlerts");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.FaceImagePath).HasMaxLength(260);
            entity.Property(a => a.Kind).HasMaxLength(40).IsRequired();
            entity.Property(a => a.Details).HasMaxLength(500);
            entity.HasOne(a => a.StaffMember)
                .WithMany()
                .HasForeignKey(a => a.StaffMemberId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
