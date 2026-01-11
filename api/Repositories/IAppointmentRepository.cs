using api.Models;

namespace api.Repositories;

public interface IAppointmentRepository
{
    Task<AppointmentEntity> CreateAsync(AppointmentEntity appointment);
    Task<IEnumerable<AppointmentEntity>> GetByDateRangeAsync(DateTime from, DateTime to);
}
