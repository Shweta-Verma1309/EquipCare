using MaintenanceApi.DTOs.Auth;

namespace MaintenanceApi.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
}