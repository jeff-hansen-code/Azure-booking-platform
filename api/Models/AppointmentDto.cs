namespace api.Models;

public class CreateAppointmentRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string ServiceType { get; set; } = string.Empty;
    public string StartUtc { get; set; } = string.Empty;
    public string EndUtc { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class CreateAppointmentResponse
{
    public string Id { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
