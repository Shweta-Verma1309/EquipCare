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
                    You are the assistant for a Smart Equipment Maintenance
                    System in an aluminium plant.

                    Help managers understand machine information, departments,
                    work orders, priorities, statuses, and employee workloads.

                    Use the provided tools whenever a question requires actual
                    database information. Never invent machine counts, work-order
                    counts, employee assignments, or machine details.

                    If a search returns multiple employees or machines, explain
                    the ambiguity and ask which one the manager means.

                    If the database does not contain the requested information,
                    say so clearly.

                    You are read-only. Never claim to create, update, assign,
                    complete, or delete any record.

                    Summarize results clearly and concisely.
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
                    description = "Get total, active, and inactive machine counts.",
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
                    description = "Get the number of machines registered in each department.",
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
                    name = "get_machine_details",
                    description = "Search machines by asset code or machine name.",
                    parameters = new
                    {
                        type = "object",
                        properties = new
                        {
                            search = new
                            {
                                type = "string",
                                description = "Machine asset code or name."
                            }
                        },
                        required = new[] { "search" },
                        additionalProperties = false
                    }
                }
            },
            new
            {
                type = "function",
                function = new
                {
                    name = "get_work_order_counts",
                    description = "Get total work orders and counts grouped by status.",
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
                    name = "get_work_orders",
                    description = "List work orders, optionally filtered by status, priority, or machine name or asset code.",
                    parameters = new
                    {
                        type = "object",
                        properties = new
                        {
                            status = new
                            {
                                type = "string",
                                description = "Exact work-order status filter, if requested."
                            },
                            priority = new
                            {
                                type = "string",
                                description = "Exact priority filter, if requested."
                            },
                            search = new
                            {
                                type = "string",
                                description = "Machine name, asset code, or work-order title."
                            }
                        },
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
                    name = "get_user_work_order_counts",
                    description = "Count assigned and open work orders for an employee by name.",
                    parameters = new
                    {
                        type = "object",
                        properties = new
                        {
                            userName = new
                            {
                                type = "string",
                                description = "Employee's full or partial name."
                            }
                        },
                        required = new[] { "userName" },
                        additionalProperties = false
                    }
                }
            },
            new
            {
                type = "function",
                function = new
                {
                    name = "get_work_order_details",
                    description = "Get details of a work order using its numeric ID.",
                    parameters = new
                    {
                        type = "object",
                        properties = new
                        {
                            workOrderId = new
                            {
                                type = "integer",
                                description = "The work order ID."
                            }
                        },
                        required = new[] { "workOrderId" },
                        additionalProperties = false
                    }
                }
            }
        };

        // First request: let Groq decide whether a tool is needed.
        var firstResponse = await SendToGroqAsync(
            messages, tools, cancellationToken);

        var firstChoice = firstResponse.GetProperty("choices")[0];
        var assistantMessage = firstChoice.GetProperty("message");

        if (!assistantMessage.TryGetProperty("tool_calls", out var toolCalls)
            || toolCalls.GetArrayLength() == 0)
        {
            var content = assistantMessage.TryGetProperty("content", out var contentElement)
                && contentElement.ValueKind == JsonValueKind.String
                    ? contentElement.GetString()
                    : null;

            return new ChatResponseDto
            {
                Reply = content ?? "Sorry, I couldn't generate a response."
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

            // Groq may provide arguments as either a JSON object or a JSON string.
            var args = GetToolArguments(function);

            object result;

            // Only execute explicitly approved functions.
            switch (functionName)
            {
                case "get_machine_count":
                    result = await _chatDataService.GetMachineCountAsync();
                    break;

                case "get_department_machine_counts":
                    result = await _chatDataService.GetDepartmentMachineCountsAsync();
                    break;

                case "get_machine_details":
                {
                    var search = GetOptionalString(args, "search") ?? "";
                    result = await _chatDataService.GetMachineDetailsAsync(search);
                    break;
                }

                case "get_work_order_counts":
                    result = await _chatDataService.GetWorkOrderCountsAsync();
                    break;

                case "get_work_orders":
                {
                    var status = GetOptionalString(args, "status");
                    var priority = GetOptionalString(args, "priority");
                    var search = GetOptionalString(args, "search");

                    result = await _chatDataService.GetWorkOrdersAsync(
                        status, priority, search);
                    break;
                }

                case "get_user_work_order_counts":
                {
                    var userName = GetOptionalString(args, "userName") ?? "";
                    result = await _chatDataService.GetUserWorkOrderCountsAsync(userName);
                    break;
                }

                case "get_work_order_details":
                {
                    if (!args.TryGetProperty("workOrderId", out var idElement)
                        || !idElement.TryGetInt32(out var workOrderId))
                    {
                        throw new InvalidOperationException(
                            "Groq did not provide a valid workOrderId.");
                    }

                    result = await _chatDataService.GetWorkOrderDetailsAsync(workOrderId);
                    break;
                }

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

        var finalReply = finalMessage.TryGetProperty("content", out var finalContent)
            && finalContent.ValueKind == JsonValueKind.String
                ? finalContent.GetString()
                : null;

        return new ChatResponseDto
        {
            Reply = finalReply ?? "Sorry, I couldn't generate a response."
        };
    }

    private static JsonElement GetToolArguments(JsonElement function)
    {
        if (!function.TryGetProperty("arguments", out var arguments))
        {
            using var emptyDocument = JsonDocument.Parse("{}");
            return emptyDocument.RootElement.Clone();
        }

        if (arguments.ValueKind == JsonValueKind.Object)
        {
            return arguments.Clone();
        }

        if (arguments.ValueKind == JsonValueKind.String)
        {
            var argumentsText = arguments.GetString();

            if (string.IsNullOrWhiteSpace(argumentsText))
            {
                using var emptyDocument = JsonDocument.Parse("{}");
                return emptyDocument.RootElement.Clone();
            }

            using var document = JsonDocument.Parse(argumentsText);

            if (document.RootElement.ValueKind != JsonValueKind.Object)
            {
                throw new InvalidOperationException(
                    "Groq returned tool arguments that are not a JSON object.");
            }

            return document.RootElement.Clone();
        }

        throw new InvalidOperationException(
            "Groq returned tool arguments in an unsupported format.");
    }

    private static string? GetOptionalString(JsonElement args, string propertyName)
    {
        if (!args.TryGetProperty(propertyName, out var value)
            || value.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined)
        {
            return null;
        }

        if (value.ValueKind == JsonValueKind.String)
        {
            return value.GetString();
        }

        throw new InvalidOperationException(
            $"Groq returned an invalid value for '{propertyName}'.");
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

        message.Headers.Authorization = new AuthenticationHeaderValue(
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
            var errorBody = await response.Content.ReadAsStringAsync(
                cancellationToken);

            throw new HttpRequestException(
                $"Groq API returned HTTP {(int)response.StatusCode}: {errorBody}");
        }

        using var document = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync(cancellationToken));

        return document.RootElement.Clone();
    }
}
