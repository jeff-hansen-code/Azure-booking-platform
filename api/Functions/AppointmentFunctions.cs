using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using api.Models;
using api.Repositories;

namespace api.Functions;

public class AppointmentFunctions
{
    private readonly ILogger<AppointmentFunctions> _logger;
    private readonly IAppointmentRepository _repository;

    public AppointmentFunctions(
        ILogger<AppointmentFunctions> logger,
        IAppointmentRepository repository)
    {
        _logger = logger;
        _repository = repository;
    }

    [Function("GetAppointments")]
    public async Task<HttpResponseData> GetAppointments(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/appointments")] HttpRequestData req)
    {
        _logger.LogInformation("Getting appointments");

        try
        {
            // Parse query parameters
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var fromStr = query["from"];
            var toStr = query["to"];

            if (string.IsNullOrEmpty(fromStr) || string.IsNullOrEmpty(toStr))
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteStringAsync("Missing required query parameters: from and to (format: YYYY-MM-DD)");
                return badRequest;
            }

            if (!DateTime.TryParse(fromStr, out var from) || !DateTime.TryParse(toStr, out var to))
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteStringAsync("Invalid date format. Use YYYY-MM-DD");
                return badRequest;
            }

            // Convert to UTC for consistency
            from = DateTime.SpecifyKind(from, DateTimeKind.Utc);
            to = DateTime.SpecifyKind(to.Date.AddDays(1).AddSeconds(-1), DateTimeKind.Utc);

            var appointments = await _repository.GetByDateRangeAsync(from, to);

            // Map to response DTOs
            var result = appointments.Select(a => new
            {
                id = a.RowKey,
                partitionKey = a.PartitionKey,
                rowKey = a.RowKey,
                startUtc = a.StartUtc.ToString("o"),
                endUtc = a.EndUtc.ToString("o"),
                customerName = a.CustomerName,
                email = a.Email,
                phone = a.Phone,
                serviceType = a.ServiceType,
                notes = a.Notes,
                status = a.Status,
                createdUtc = a.CreatedUtc.ToString("o")
            }).ToList();

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(result);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting appointments");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync($"Error: {ex.Message}");
            return errorResponse;
        }
    }

    [Function("CreateAppointment")]
    public async Task<HttpResponseData> CreateAppointment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/appointments")] HttpRequestData req)
    {
        _logger.LogInformation("Creating appointment");

        try
        {
            // Parse request body
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var request = JsonSerializer.Deserialize<CreateAppointmentRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null)
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteStringAsync("Invalid request body");
                return badRequest;
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.CustomerName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Phone) ||
                string.IsNullOrWhiteSpace(request.ServiceType) ||
                string.IsNullOrWhiteSpace(request.StartUtc) ||
                string.IsNullOrWhiteSpace(request.EndUtc))
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteStringAsync("Missing required fields");
                return badRequest;
            }

            // Parse dates
            if (!DateTime.TryParse(request.StartUtc, out var startUtc) ||
                !DateTime.TryParse(request.EndUtc, out var endUtc))
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteStringAsync("Invalid date format");
                return badRequest;
            }

            // Ensure dates are in UTC
            startUtc = startUtc.ToUniversalTime();
            endUtc = endUtc.ToUniversalTime();

            // Validate date range
            if (endUtc <= startUtc)
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteStringAsync("End time must be after start time");
                return badRequest;
            }

            if (startUtc < DateTime.UtcNow.AddMinutes(-30))
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteStringAsync("Cannot book appointments in the past");
                return badRequest;
            }

            // Create entity
            var appointmentId = Guid.NewGuid().ToString();
            var partitionKey = startUtc.ToString("yyyyMMdd");

            var entity = new AppointmentEntity
            {
                PartitionKey = partitionKey,
                RowKey = appointmentId,
                StartUtc = startUtc,
                EndUtc = endUtc,
                CustomerName = request.CustomerName,
                Email = request.Email,
                Phone = request.Phone,
                ServiceType = request.ServiceType,
                Notes = request.Notes,
                Status = "Requested",
                CreatedUtc = DateTime.UtcNow
            };

            await _repository.CreateAsync(entity);

            var result = new CreateAppointmentResponse
            {
                Id = appointmentId,
                Message = "Appointment created successfully"
            };

            var response = req.CreateResponse(HttpStatusCode.Created);
            await response.WriteAsJsonAsync(result);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating appointment");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync($"Error: {ex.Message}");
            return errorResponse;
        }
    }
}
