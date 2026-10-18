
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using MaintenanceApi.DTOs.Chat;
using MaintenanceApi.Interfaces;

namespace MaintenanceApi.Services;

public class GroqChatService : IChatService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ChatDataService _chatDataService;

    public GroqChatService(
        HttpClient httpClient,
        IConfiguration configuration,
        ChatDataService chatDataService)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _chatDataService = chatDataService;
    }

    public async Task<ChatResponseDto> AskAsync(
        ChatRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["GROQ_API_KEY"]
            ?? throw new InvalidOperationException(
                "GROQ_API_KEY environment variable is missing.");

        var messages = new List<object>
        {
            new
            {
                role = "system",
                content = """
                    You are the assistant for a Smart Equipment
                    Maintenance System in an aluminium plant.

                    Answer general maintenance questions helpfully.
                    For questions about actual machines or department
                    counts, use the provided tools.

                    Never invent database numbers. Only state live
                    machine counts returned by the tools.
                    If the tools do not provide the requested data,
                    explain that the information is not available.
                    """
            },
            new
            {
                role = "user",
                content = request.Message
            }
        };

        var tools = new object[]
        {
            new
            {
                type = "function",
                function = new
                {
                    name = "get_machine_count",
                    description =
                        "Get total, active, and inactive machine counts.",
                    parameters = new
                    {
                        type = "object",
                        properties = new { },
                        required = Array.Empty<string>(),
                        additionalProperties = false
                    }
                }
            },
            new
            {
                type = "function",
                function = new
                {
                    name = "get_department_machine_counts",
                    description =
                        "Get the number of machines registered in each department.",
                    parameters = new
                    {
                        type = "object",
                        properties = new { },
                        required = Array.Empty<string>(),
                        additionalProperties = false
                    }
                }
            }
        };

        // First request: let Groq decide whether a tool is needed.
        var firstResponse = await SendToGroqAsync(
            messages, tools, cancellationToken);

        var firstChoice = firstResponse
            .GetProperty("choices")[0];

        var assistantMessage = firstChoice
            .GetProperty("message");

        if (!assistantMessage.TryGetProperty(
                "tool_calls", out var toolCalls)
            || toolCalls.GetArrayLength() == 0)
        {
            var content = assistantMessage
                .TryGetProperty("content", out var contentElement)
                && contentElement.ValueKind == JsonValueKind.String
                    ? contentElement.GetString()
                    : null;

            return new ChatResponseDto
            {
                Reply = content ??
                    "Sorry, I couldn't generate a response."
            };
        }

        // Preserve Groq's assistant tool-call message in the conversation.
        messages.Add(JsonSerializer.Deserialize<object>(
            assistantMessage.GetRawText())!);

        foreach (var toolCall in toolCalls.EnumerateArray())
        {
            var function = toolCall.GetProperty("function");
            var functionName = function.GetProperty("name").GetString();
            var toolCallId = toolCall.GetProperty("id").GetString();

            object result;

            // Only execute explicitly approved functions.
            switch (functionName)
            {
                case "get_machine_count":
                    result = await _chatDataService
                        .GetMachineCountAsync();
                    break;

                case "get_department_machine_counts":
                    result = await _chatDataService
                        .GetDepartmentMachineCountsAsync();
                    break;

                default:
                    throw new InvalidOperationException(
                        "The requested chatbot tool is not allowed.");
            }

            messages.Add(new
            {
                role = "tool",
                tool_call_id = toolCallId,
                content = JsonSerializer.Serialize(result)
            });
        }

        // Second request: Groq explains the real database results.
        var finalResponse = await SendToGroqAsync(
            messages, tools, cancellationToken);

        var finalMessage = finalResponse
            .GetProperty("choices")[0]
            .GetProperty("message");

        var finalReply = finalMessage
            .TryGetProperty("content", out var finalContent)
            && finalContent.ValueKind == JsonValueKind.String
                ? finalContent.GetString()
                : null;

        return new ChatResponseDto
        {
            Reply = finalReply ??
                "Sorry, I couldn't generate a response."
        };
    }

    private async Task<JsonElement> SendToGroqAsync(
        List<object> messages,
        object[] tools,
        CancellationToken cancellationToken)
    {
        var payload = new
        {
            model = "openai/gpt-oss-120b",
            messages,
            tools,
            tool_choice = "auto",
            max_completion_tokens = 700
        };

        using var message = new HttpRequestMessage(
            HttpMethod.Post,
            "https://api.groq.com/openai/v1/chat/completions");

        message.Headers.Authorization =
            new AuthenticationHeaderValue(
                "Bearer",
                _configuration["GROQ_API_KEY"]);

        message.Content = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json");

        using var response = await _httpClient.SendAsync(
            message, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content
                .ReadAsStringAsync(cancellationToken);

            throw new HttpRequestException(
                $"Groq API returned HTTP {(int)response.StatusCode}: " +
                errorBody);
        }

        using var document = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync(
                cancellationToken));

        return document.RootElement.Clone();
    }
}
