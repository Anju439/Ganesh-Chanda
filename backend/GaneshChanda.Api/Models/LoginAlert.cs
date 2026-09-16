namespace GaneshChanda.Api.Models;

public class LoginAlert
{
    public int Id { get; set; }
    public int StaffMemberId { get; set; }
    public StaffMember StaffMember { get; set; } = null!;
    public string FaceImagePath { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; }
    public string Kind { get; set; } = "FaceLogin";
    public string Details { get; set; } = string.Empty;
}
