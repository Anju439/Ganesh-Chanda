namespace GaneshChanda.Api.Models;

public class LoginAudit
{
    public int Id { get; set; }
    public int StaffMemberId { get; set; }
    public StaffMember StaffMember { get; set; } = null!;
    public DateTime LoggedInAt { get; set; } = DateTime.UtcNow;
    public string FaceImagePath { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
}
