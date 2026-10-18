
using MaintenanceApi.DTOs.Chat;

namespace MaintenanceApi.Interfaces;

public interface IChatService
{
    Task<ChatResponseDto> AskAsync(
        ChatRequestDto request,
        CancellationToken cancellationToken = default);
}
