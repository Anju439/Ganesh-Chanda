using System.ComponentModel.DataAnnotations;

namespace GaneshChanda.Api.DTOs;

public class LoginRequest
{
    [Required, StringLength(80, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required, StringLength(80, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;
}

public class FaceLoginRequest
{
    [Required]
    public string PendingToken { get; set; } = string.Empty;

    [Required]
    public string FaceImage { get; set; } = string.Empty;
}

public class PendingLoginResponse
{
    public string PendingToken { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public bool RequiresFace { get; set; } = true;
    public bool NotifyMainAdmin { get; set; }
    public StaffDto Staff { get; set; } = new();
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public StaffDto Staff { get; set; } = new();
    public bool SentToMainAdmin { get; set; }
}

public class StaffDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsMainAdmin { get; set; }
}

public class LoginAuditDto
{
    public int Id { get; set; }
    public int StaffMemberId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public DateTime LoggedInAt { get; set; }
    public string FaceImageUrl { get; set; } = string.Empty;
}

public class LoginAlertDto
{
    public int Id { get; set; }
    public int StaffMemberId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string FaceImageUrl { get; set; } = string.Empty;
    public bool IsRead { get; set; }
}
