
using MaintenanceApi.DTOs.Users;

namespace MaintenanceApi.Interfaces;

public interface IUserService
{
    Task<List<UserResponseDto>> GetAllAsync();
    Task<UserResponseDto?> GetByIdAsync(int id);
    Task<UserResponseDto?> CreateAsync(UserCreateDto dto);
    

    Task<UserResponseDto?> UpdateAsync(int id, UserUpdateDto dto);
    Task<bool> DeactivateAsync(int id);
    Task<bool> ReactivateAsync(int id);
}
