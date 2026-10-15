namespace MaintenanceApi.DTOs.Auth;

public class LoginResponseDto
{
    public string Token { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public List<string> Roles { get; set; } = [];
}