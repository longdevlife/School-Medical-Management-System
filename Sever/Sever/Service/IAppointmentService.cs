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
        private readonly IEmailService _emailService;
        private readonly IUserService _userService;
        public AppointmentService(IAppointmentRepository appointmentRepository,
                                    INotificationService notificationService,
                                    IHealthCheckupRepository healthCheckupRepository,
                                    IStudentProfileRepository studentProfileRepository,
                                    IEmailService emailService,
                                    IUserService userService)
        {
            _appointmentRepository = appointmentRepository;
            _notificationService = notificationService;
            _healthCheckupRepository = healthCheckupRepository;
            _studentProfileRepository = studentProfileRepository;
            _emailService = emailService;
            _userService = userService;
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
                    StudentID = student.StudentID
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
            await _appointmentRepository.UpdateAppointmentByIdAsync(app);
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
            var healthCheck = await _healthCheckupRepository.GetHealthCheckUpByIdAsync(newAppointment.HealthCheckUpID);
            var student = await _studentProfileRepository.GetStudentProfileByStudentId(healthCheck.StudentID);
            var parent = await _userService.GetUserByIdAsyc(student.Parent.UserID);
            var ConsultantName = await _userService.GetUserByIdAsyc(healthCheck.CheckerID);
            string message = $@"
                            <p>Kính gửi Quý phụ huynh,</p>

                            <p>Nhà trường xin thông báo về cuộc hẹn tư vấn sức khỏe dành cho học sinh như sau:</p>

                            <ul>
                                <li><b>Họ và tên học sinh:</b> {student.StudentName}</li>
                                <li><b>Lớp:</b> {student.Class}</li>
                                <li><b>Thời gian tư vấn:</b> {appointment.DateTime:HH:mm} {(appointment.DateTime.Hour < 12 ? "sáng" : "chiều")}, ngày <b>{appointment.DateTime:dd/MM/yyyy}</b></li>
                                <li><b>Địa điểm:</b> Phòng Y tế – Trường Tiểu học ABC</li>
                                <li><b>Người tư vấn:</b> {ConsultantName.Name}</li>
                            </ul>

                            <p>Cuộc hẹn nhằm trao đổi, tư vấn và theo dõi tình trạng sức khỏe của học sinh. Mong quý phụ huynh thu xếp thời gian để học sinh tham dự đầy đủ.</p>

                            <p>Vui lòng đăng nhập vào hệ thống để kiểm tra thông tin và xác nhận tham gia cuộc hẹn tư vấn.</p>

                            <br>
                            <p>Trân trọng,</p>
                            <p><b>Ban Y tế Trường học</b></p>
                            ";

            _= _emailService.SendEmailAsync(parent.Email, "Thông báo kết cuộc hẹn tư vấn sức khỏe", message);
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
                if (appointments != null)
                {
                    studenAppointments.Add(appointments);
                }
                
            }
            return studenAppointments;
        }
    }
}
