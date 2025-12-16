using Azure.Data.Tables;
using api.Models;

namespace api.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly TableClient _tableClient;

    public AppointmentRepository(TableClient tableClient)
    {
        _tableClient = tableClient;
    }

    public async Task<AppointmentEntity> CreateAsync(AppointmentEntity appointment)
    {
        await _tableClient.AddEntityAsync(appointment);
        return appointment;
    }

    public async Task<IEnumerable<AppointmentEntity>> GetByDateRangeAsync(DateTime from, DateTime to)
    {
        var appointments = new List<AppointmentEntity>();
        
        // Generate partition keys for all days in the range
        var partitionKeys = new List<string>();
        for (var date = from.Date; date <= to.Date; date = date.AddDays(1))
        {
            partitionKeys.Add(date.ToString("yyyyMMdd"));
        }

        // Query each partition
        foreach (var partitionKey in partitionKeys)
        {
            var query = _tableClient.QueryAsync<AppointmentEntity>(
                filter: $"PartitionKey eq '{partitionKey}'");

            await foreach (var appointment in query)
            {
                // Additional filter in case partition contains appointments outside the range
                if (appointment.StartUtc >= from && appointment.StartUtc <= to)
                {
                    appointments.Add(appointment);
                }
            }
        }

        return appointments.OrderBy(a => a.StartUtc);
    }
}
