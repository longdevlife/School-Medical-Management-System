using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.DTO.MedicalEvent;
using Sever.Model;
using Sever.Repository;
using Sever.Repository.Interfaces;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Sever.Service
{
    public interface INotificationService
    {
        Task MedicalEventNotification(MedicalEvent medicalEvent, string customMessage = null);
        Task MedicineNotificationForParent(Medicine medicine, string customMessage = null);
        Task MedicineNotificationForAllNurses(Medicine medicine, string customMessage = null);
        Task<bool> AppointmentNotify(Appointment appointment);
        Task<bool> SendHealthCheckupNotificationAsync(StudentProfile student, DateTime date);
        Task<bool> UpdateHealthCheckUpNotifycationAsync(StudentProfile student);
    }
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IUserRepository _userRepository;
        private readonly IStudentProfileRepository _studentProfileRepository;
        private readonly IHealthCheckupRepository _healthCheckUpRepository;
        public NotificationService(
            INotificationRepository notificationRepository,
            IUserRepository userRepository,
            IStudentProfileRepository studentProfileRepository,
            IHealthCheckupRepository healthCheckUpRepository)
        {
            _notificationRepository = notificationRepository;
            _userRepository = userRepository;
            _studentProfileRepository = studentProfileRepository;
            _healthCheckUpRepository = healthCheckUpRepository;
        }

        public async Task MedicalEventNotification(MedicalEvent medicalEvent, string customMessage = null)
        {
            try
            {
                if (medicalEvent.MedicalEventDetail == null || !medicalEvent.MedicalEventDetail.Any())
                {
                    throw new Exception("Không có học sinh nào trong sự kiện y tế để gửi thông báo.");
                }

                var studentIds = medicalEvent.MedicalEventDetail.Select(d => d.StudentID).Distinct().ToList();

                foreach (var studentId in studentIds)
                {
                    var parentId = await _notificationRepository.GetParentIdByStudentIdAsync(studentId);
                    if (string.IsNullOrEmpty(parentId)) continue;

                    var parentExists = await _notificationRepository.CheckParentExistsAsync(parentId);
                    if (!parentExists) continue;

                    string notifyId = await _notificationRepository.GetCurrentNotifyID();

                    var notification = new Notify
                    {
                        NotifyID = notifyId,
                        UserID = parentId,
                        NotifyName = "Cập nhật thông tin sự kiện y tế",
                        DateTime = DateTime.UtcNow.AddHours(7),
                        Title = "CẬP NHẬT SỰ KIỆN Y TẾ",
                        Description = customMessage ?? $"Sự kiện y tế {medicalEvent.EventType} đã được cập nhật. Vui lòng kiểm tra chi tiết."
                    };

                    await _notificationRepository.AddNotificationAsync(notification);
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi gửi thông báo sự kiện y tế.", ex);
            }
        }




        public async Task MedicineNotificationForParent(Medicine medicine, string customMessage = null)
        {
            try
            {
                var parentId = await _notificationRepository.GetParentIdByStudentIdAsync(medicine.StudentID);
                if (string.IsNullOrEmpty(parentId))
                {
                    return;
                }
                var parentExists = await _notificationRepository.CheckParentExistsAsync(parentId);
                if (!parentExists)
                {
                    return;
                }

                string notifyId = await _notificationRepository.GetCurrentNotifyID();

                var notification = new Notify
                {
                    NotifyID = notifyId,
                    UserID = parentId,
                    NotifyName = "Cập nhật thông tin đơn thuốc từ y tá",
                    DateTime = DateTime.UtcNow.AddHours(7),
                    Title = "CẬP NHẬT ĐƠN THUỐC",
                    Description = customMessage ?? $"Đơn thuốc {medicine.MedicineName} đã được cập nhật. Vui lòng kiểm tra chi tiết.",
                };

                await _notificationRepository.AddNotificationAsync(notification);
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi gửi thông báo đơn thuốc.", ex);
            }
        }

        public async Task MedicineNotificationForAllNurses(Medicine medicine, string customMessage = null)
        {
            try
            {
                var allNurseIDs = await _notificationRepository.GetAllNurseIDsAsync();
                if (allNurseIDs == null || !allNurseIDs.Any())
                    return;

                foreach (var nurseID in allNurseIDs)
                {
                    string notifyId = await _notificationRepository.GetCurrentNotifyID();

                    var notification = new Notify
                    {

                        NotifyID = notifyId,
                        UserID = nurseID,
                        NotifyName = "Cập nhật thông tin đơn thuốc từ phụ huynh",
                        DateTime = DateTime.UtcNow.AddHours(7),
                        Title = "CẬP NHẬT ĐƠN THUỐC",
                        Description = customMessage ?? $"Đơn thuốc \"{medicine.MedicineName}\" vừa được tạo. Vui lòng kiểm tra.",
                    };

                    await _notificationRepository.AddNotificationAsync(notification);
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi gửi thông báo đơn thuốc đến các y tá.", ex);
            }
        }
        public async Task<bool> SendHealthCheckupNotificationAsync(StudentProfile student, DateTime date)
        {
            try
            {
                string notifyId = await _notificationRepository.GetCurrentNotifyID();
                var notification = new Notify
                {
                    NotifyID = notifyId,
                    UserID = student.ParentID,
                    NotifyName = "Khám sức khỏe định kì",
                    DateTime = DateTime.UtcNow,
                    Title = "KHÁM SỨC KHỎE ĐỊNH KÌ",
                    Description = $"Thông báo khám sức khỏe định kì của {student.StudentName} vào ngày {date} mong quý phụ huynh xác nhận cho con khám sức khỏe"
                };
                await _notificationRepository.AddNotificationAsync(notification);
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi gửi thông báo khám sức khỏe.", ex);
            }
            return false;
        }

        public async Task<bool> UpdateHealthCheckUpNotifycationAsync(StudentProfile student)
        {
            try
            {
                string notifyId = await _notificationRepository.GetCurrentNotifyID();
                var notification = new Notify
                {
                    NotifyID = notifyId,
                    UserID = student.ParentID,
                    NotifyName = "Khám sức khỏe định kì",
                    DateTime = DateTime.UtcNow,
                    Title = "KHÁM SỨC KHỎE ĐỊNH KÌ",
                    Description = $"Thông báo cập nhât khám sức khỏe định kì của {student.StudentName} vào ngày {DateTime.UtcNow} mong quý phụ huynh theo dõi kết quả khám sức khỏe"
                };
                await _notificationRepository.AddNotificationAsync(notification);
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi gửi thông báo cập nhật khám sức khỏe.", ex);
            }
            return false;
        }

        public async Task<bool> AppointmentNotify(Appointment appointment)
        {
            try
            {
                var healthCheckUp = await _healthCheckUpRepository.GetHealthCheckUpByIdAsync(appointment.HealthCheckUpID);
                var student = await _studentProfileRepository.SearchStudentProfile(healthCheckUp.StudentID);
                string notifyId = await _notificationRepository.GetCurrentNotifyID();
                var notification = new Notify
                {
                    NotifyID = notifyId,
                    UserID = student.ParentID,
                    NotifyName = "Cuộc hẹn khám sức khỏe",
                    DateTime = DateTime.UtcNow,
                    Title = "Cuộc hẹn khám sức khỏe",
                    Description = $"Học sinh {student} đang có vấn đề về {appointment.Reason} mong phụ huynh có thể xác nhận đi cùng và tham gia cuộc hẹn tư vấn sức khỏe cho em"
                };
                await _notificationRepository.AddNotificationAsync(notification);
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi gửi thông báo cuộc hẹn khám sức khỏe.", ex);
            }
        }
    }
}
