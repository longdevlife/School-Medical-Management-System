using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.Model;
using Sever.Utilities;
using System.Threading.Tasks;

namespace Sever.Repository
{
    public interface IAppointmentRepository
    {
        Task<List<Appointment>> GetAllAppointmentAsync();
        Task<Appointment> GetAppointmentByIdAsync(string id);
        Task<Appointment> GetAppointmentByHealCheckupAsync(string healthCheckUpId);
        Task<bool> GetConfirmAppointment();
        Task<bool> UpdateAppointmentByIdAsync(Appointment appointment);
        Task<bool>UpdateStatus(Appointment appointment, string status);
        Task<bool> CreateAppointment(Appointment appointment);
        Task<string> NewID();
    }
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly DataContext _context;
        public AppointmentRepository(DataContext dataContext)
        {
            _context = dataContext;
        }

        public async Task<bool> UpdateStatus(Appointment appointment,string status)
        {
            var apm = await GetAppointmentByIdAsync(appointment.AppointmentID);
            apm.Status = status;
            _context.Appointment.Update(apm);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<List<Appointment>> GetAllAppointmentAsync()
        {
            return await _context.Appointment.ToListAsync();
        }

        public async Task<Appointment> GetAppointmentByHealCheckup(string healthCheckUpId)
        {
            return await _context.Appointment.FirstOrDefaultAsync(a => a.HealthCheckUpID == healthCheckUpId);
        }

        public Task<Appointment> GetAppointmentByHealCheckupAsync(string healthCheckUpId)
        {
            var appointment = GetAppointmentByHealCheckup(healthCheckUpId);
            if (appointment == null) throw new ArgumentException("No appointment found for the specified Health Check Up ID.");
            return appointment;
        }

        public async Task<Appointment> GetAppointmentByIdAsync(string id)
        {
            return await _context.Appointment.FirstOrDefaultAsync(a => a.AppointmentID == id);
        }

        public async Task<bool> UpdateAppointmentByIdAsync(Appointment appointment)
        {
            var apm = await GetAppointmentByIdAsync(appointment.AppointmentID);
            if(apm ==  null) throw new ArgumentException("Không tìm thấy cuộc hẹn theo Id này");
            _context.Appointment.Update(apm);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public Task<bool> GetConfirmAppointment()
        {
            return _context.Appointment.AnyAsync(a => a.Status == "Đã xác nhận");
        }

        public async Task<string> NewID()
        {
            var appointment = await _context.Appointment
                .OrderByDescending(a => a.AppointmentID)
                .FirstOrDefaultAsync();

            var lastId = appointment?.AppointmentID ?? "AP0001";
            return GenerateID.GenerateNextId(lastId, "AP", 4);
        }


        public async Task<bool> CreateAppointment( Appointment appointment)
        {
           var result = await _context.Appointment.AddAsync(appointment);
            if (result == null) throw new ArgumentException("Failed to create appointment for the specified Health Check Up ID.");
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
