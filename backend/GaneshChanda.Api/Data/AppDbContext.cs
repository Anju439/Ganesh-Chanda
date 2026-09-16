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
    }
}
