namespace GaneshChanda.Api.Models;

public class PendingLogin
{
    public int Id { get; set; }
    public int StaffMemberId { get; set; }
    public StaffMember StaffMember { get; set; } = null!;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool Completed { get; set; }
}
