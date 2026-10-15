
using MaintenanceApi.Data;
using MaintenanceApi.DTOs.Users;
using MaintenanceApi.Interfaces;
using MaintenanceApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MaintenanceApi.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UserService(
        AppDbContext context,
        IPasswordHasher<User> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<List<UserResponseDto>> GetAllAsync()
    {
        return await _context.Users
            .AsNoTracking()
            .OrderBy(u => u.FullName)
            .Select(u => new UserResponseDto
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                EmployeeCode = u.EmployeeCode,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<UserResponseDto?> GetByIdAsync(int id)
    {
        return await _context.Users
            .AsNoTracking()
            .Where(u => u.UserId == id)
            .Select(u => new UserResponseDto
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                EmployeeCode = u.EmployeeCode,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<UserResponseDto?> CreateAsync(UserCreateDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();

        var emailExists = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == email);

        if (emailExists)
            return null;

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = email,
            EmployeeCode = string.IsNullOrWhiteSpace(dto.EmployeeCode)
                ? null
                : dto.EmployeeCode.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            dto.Password
        );

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserResponseDto
        {
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            EmployeeCode = user.EmployeeCode,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }



    public async Task<UserResponseDto?> UpdateAsync(int id, UserUpdateDto dto)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return null;

        var email = dto.Email.Trim().ToLowerInvariant();

        if (await _context.Users.AnyAsync(u =>
            u.UserId != id && u.Email.ToLower() == email))
            throw new InvalidOperationException("Email is already in use.");

        user.FullName = dto.FullName.Trim();
        user.Email = email;
        user.EmployeeCode = dto.EmployeeCode?.Trim();

        await _context.SaveChangesAsync();

        return new UserResponseDto
        {
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            EmployeeCode = user.EmployeeCode,
            IsActive = user.IsActive
        };
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return false;

        user.IsActive = false;
        await _context.SaveChangesAsync();

        return true;
    }

}
