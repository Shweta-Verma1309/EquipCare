
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MaintenanceApi.DTOs.Chat;
using MaintenanceApi.Interfaces;

namespace MaintenanceApi.Controllers;

[ApiController]
[Route("api/chat")]
// [Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost("ask")]
    public async Task<ActionResult<ChatResponseDto>> Ask(
        [FromBody] ChatRequestDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _chatService.AskAsync(
                request, cancellationToken);

            return Ok(response);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.ToString());

            return StatusCode(500, new
            {
                message = "Chatbot request failed.",
                error = ex.Message
            });
        }
    }
}
