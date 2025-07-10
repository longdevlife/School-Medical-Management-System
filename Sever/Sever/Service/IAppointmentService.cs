using Sever.DTO.Appointment;
using Sever.Model;
using Sever.Repository;

namespace Sever.Service
{
    public interface IAppointmentService
    {
        Task<List<GetAppointment>> GetAllAppointmentAsync();
        Task<bool> CreateAppointmentAsync(CreateAppointment appointment);
        Task<Appointment> GetAppointmentByIdAsync(string id);
        Task<Appointment> GetAppointmentByHealCheckupAsync(string healthCheckUpId);
        Task<bool> UpdateAppointmentByIdAsync(UpdateAppointment appointment);
        Task<bool> GetConfirmAppointment();
        Task<bool> ConfirmAppointMent(UpdateAppointment dto);
        Task<bool> DeniedAppointMent(UpdateAppointment dto);
        Task<List<Appointment>> GetAppointmentByStudentId(string Id);
    }

    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly INotificationService _notificationService;
        private readonly IHealthCheckupRepository _healthCheckupRepository;
        private readonly IStudentProfileRepository _studentProfileRepository;
        public AppointmentService(IAppointmentRepository appointmentRepository,
                                    INotificationService notificationService,
                                    IHealthCheckupRepository healthCheckupRepository,
                                    IStudentProfileRepository studentProfileRepository)
        {
            _appointmentRepository = appointmentRepository;
            _notificationService = notificationService;
            _healthCheckupRepository = healthCheckupRepository;
            _studentProfileRepository = studentProfileRepository;
        }
        public async Task<List<GetAppointment>> GetAllAppointmentAsync()
        {
            var appointments = new List<GetAppointment>();
            var results = await _appointmentRepository.GetAllAppointmentAsync();
            foreach (var result in results)
            {
                var healthCheck = await _healthCheckupRepository.GetHealthCheckUpByIdAsync(result.HealthCheckUpID);
                var student = await _studentProfileRepository.GetStudentProfileByStudentId(healthCheck.StudentID);
                appointments.Add(new GetAppointment
                {
                    AppointmentID = result.AppointmentID,
                    StudentName = student.StudentName,
                    ClasseName = student.Class,
                    DateTime = result.DateTime,
                    Location = result.Location,
                    Reason = result.Reason,
                    Status = result.Status,
                    Notes = result.Notes,
                    HealthCheckUpID = healthCheck.HealthCheckUpID,
                });
            }
            return appointments;
        }
        public async Task<Appointment> GetAppointmentByIdAsync(string id)
        {
            return await _appointmentRepository.GetAppointmentByIdAsync(id);
        }
        public async Task<Appointment> GetAppointmentByHealCheckupAsync(string healthCheckUpId)
        {
            return await _appointmentRepository.GetAppointmentByHealCheckupAsync(healthCheckUpId);
        }
        public async Task<bool> UpdateAppointmentByIdAsync(UpdateAppointment appointment)
        {
            var app = await GetAppointmentByIdAsync(appointment.AppointmentID);
            if (app == null) throw new ArgumentException("No appointment found for the specified ID.");
            app.Notes = appointment.Notes;
            app.Status = "Đã Tham Gia";
            return true;
        }
        public async Task<bool> GetConfirmAppointment()
        {
            return await _appointmentRepository.GetConfirmAppointment();
        }
        public async Task<bool> ConfirmAppointMent(UpdateAppointment dto)
        {
            var appointment = await GetAppointmentByIdAsync(dto.AppointmentID);
            if (appointment == null) throw new ArgumentException("No appointment found for the specified ID.");
            appointment.Notes = dto.Notes;
            return await _appointmentRepository.UpdateStatus(appointment, "Đã xác nhận");
        }
        public async Task<bool> DeniedAppointMent(UpdateAppointment dto)
        {
            var appointment = await GetAppointmentByIdAsync(dto.AppointmentID);
            if (appointment == null) throw new ArgumentException("No appointment found for the specified ID.");
            appointment.Notes = dto.Notes;
            return await _appointmentRepository.UpdateStatus(appointment, "Đã từ chối");
        }
        public async Task<bool> CreateAppointmentAsync(CreateAppointment newAppointment)
        {
            var appointment = new Appointment
            {
                AppointmentID = await _appointmentRepository.NewID(),
                HealthCheckUpID = newAppointment.HealthCheckUpID,
                Reason = newAppointment.Reason,
                Location = newAppointment.Location,
                Notes = newAppointment.Notes,
                DateTime = newAppointment.DateTime,
                Status = "Chờ xác nhận"
            };
            if (appointment == null) throw new ArgumentNullException("Appointment cannot be null");
            await _appointmentRepository.CreateAppointment(appointment);
            await _notificationService.AppointmentNotify(appointment);
            return true;
        }

        public async Task<List<Appointment>> GetAppointmentByStudentId(string Id)
        {
            var studenAppointments = new List<Appointment>();
            var healthCheckUps = await _healthCheckupRepository.GetHealthCheckupsByStudentIdAsync(Id);
            if (healthCheckUps == null || !healthCheckUps.Any())
            {
                throw new ArgumentException("No health checkups found for the specified student ID.");
            }
            foreach (var healthCheck in healthCheckUps)
            {
                var appointments = await _appointmentRepository.GetAppointmentByHealCheckupAsync(healthCheck.HealthCheckUpID);
                if (appointments == null)
                {
                    throw new ArgumentException("No appointments found for the specified health checkup ID.");
                }
                studenAppointments.Add(appointments);
            }
            return studenAppointments;
        }
    }
}
