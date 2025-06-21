using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.DTO.MedicalEvent;
using Sever.Model;
using Sever.Repository;
using Sever.Repository.Interfaces;

namespace Sever.Service
{
    public interface INotificationService
    {
        Task MedicalEventNotification(MedicalEvent medicalEvent, string customMessage = null);
        Task MedicineNotificationForParent(Medicine medicine, string customMessage = null);
        Task MedicineNotificationForAllNurses(Medicine medicine, string customMessage = null);
    }
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;

        public NotificationService(
            INotificationRepository notificationRepository,
            DataContext context )
        {
            _notificationRepository = notificationRepository;
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
    }
}
