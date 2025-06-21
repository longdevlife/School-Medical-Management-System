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
        Task MedicineNotificationForNurse(Medicine medicine, string customMessage = null);

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
                if (string.IsNullOrEmpty(medicalEvent.ParentID))
                {
                    return;
                }
                var parentExists = await _notificationRepository.CheckParentExistsAsync(medicalEvent.ParentID);
                if (!parentExists) return;

                string notifyId = await _notificationRepository.GetCurrentNotifyID();

                var notification = new Notify
                {
                    NotifyID = notifyId,
                    UserID = medicalEvent.ParentID,
                    NotifyName = "Cập nhật thông tin sự kiện y tế",
                    DateTime = DateTime.UtcNow.AddHours(7),
                    Title = "CẬP NHẬT SỰ KIỆN Y TẾ",
                    Description = customMessage ?? $"Sự kiện y tế {medicalEvent.EventType} đã được cập nhật. Vui lòng kiểm tra chi tiết."
                };

                await _notificationRepository.AddNotificationAsync(notification);
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi gửi thông báo đơn thuốc.", ex);
            }
        }

       
        public async Task MedicineNotificationForParent(Medicine medicine, string customMessage = null)
        {
            try
            {
                if (string.IsNullOrEmpty(medicine.ParentID))
                {
                    return;
                }
                var parentExists = await _notificationRepository.CheckParentExistsAsync(medicine.ParentID);
                if (!parentExists) return;

                string notifyId = await _notificationRepository.GetCurrentNotifyID();

                var notification = new Notify
                {
                    NotifyID = notifyId,
                    UserID = medicine.ParentID,
                    NotifyName = "Cập nhật thông tin đơn thuốc từ phụ huynh",
                    DateTime = DateTime.UtcNow.AddHours(7),
                    Title = "CẬP NHẬT ĐƠN THUỐC",
                    Description = customMessage ?? $"Đơn thuốc {medicine.MedicineName} đã được cập nhật. Vui lòng kiểm tra chi tiết."
                };

                await _notificationRepository.AddNotificationAsync(notification);
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi gửi thông báo đơn thuốc.", ex);
            }
        }

        public async Task MedicineNotificationForNurse(Medicine medicine, string customMessage = null)
        {
            try
            {
                if (string.IsNullOrEmpty(medicine.NurseID))
                {
                    return;
                }
                var parentExists = await _notificationRepository.CheckNurseExistsAsync(medicine.NurseID);
                if (!parentExists) return;

                string notifyId = await _notificationRepository.GetCurrentNotifyID();

                var notification = new Notify
                {
                    NotifyID = notifyId,
                    UserID = medicine.NurseID,
                    NotifyName = "Cập nhật thông tin đơn thuốc từ y tá",
                    DateTime = DateTime.UtcNow.AddHours(7),
                    Title = "CẬP NHẬT ĐƠN THUỐC",
                    Description = customMessage ?? $"Đơn thuốc {medicine.MedicineName} đã được cập nhật. Vui lòng kiểm tra chi tiết.",
                    User = null 
                };

                await _notificationRepository.AddNotificationAsync(notification);
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi gửi thông báo đơn thuốc.", ex);
            }
        }
    }
}
