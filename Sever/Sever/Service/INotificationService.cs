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
        Task MedicineNotification(Medicine medicine, string customMessage = null);

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
                const string formId = "F003";
                var form = await _notificationRepository.GetFormByIdAsync(formId);
                if (form == null)
                {
                    form = new Form
                    {
                        FormID = formId,
                        FormName = "SỰ KIỆN Y TẾ",
                        Description = "Thông tin sự kiện y tế",
                        Link = "link-lien-quan"
                    };
                    await _notificationRepository.CreateFormAsync(form);
                }

                var notify = new Notify
                {
                    NotifyID = await _notificationRepository.GenerateNotifyIDAsync(),
                    FormID = form.FormID,
                    UserID = medicalEvent.NurseID,
                    NotifyName = "Sự kiện y tế mới",
                    Title = "TẠO SỰ KIỆN Y TẾ",
                    Description = customMessage ?? $"Sự kiện y tế {medicalEvent.Description} đã được ghi nhận.",
                    DateTime = DateTime.UtcNow.AddHours(7)
                };
                await _notificationRepository.AddNotificationAsync(notify);

                var parentIds = await _notificationRepository.GetParentIdsByMedicalEventAsync(medicalEvent.MedicalEventID);

                foreach (var parentId in parentIds)
                {
                    var parentNotify = new Notify
                    {
                        NotifyID = await _notificationRepository.GenerateNotifyIDAsync(),
                        FormID = form.FormID,
                        UserID = parentId,
                        NotifyName = "Cập nhật sự kiện y tế",
                        Title = "CẬP NHẬT SỰ KIỆN Y TẾ",
                        Description = customMessage ?? $"Sự kiện y tế mới được ghi nhận vào {medicalEvent.EventDateTime:dd/MM/yyyy HH:mm}.",
                        DateTime = DateTime.UtcNow.AddHours(7)
                    };

                    await _notificationRepository.AddNotificationAsync(parentNotify);
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi gửi thông báo sự kiện y tế.", ex);
            }
        }
        public async Task MedicineNotification(Medicine medicine, string customMessage = null)
        {
            try
            {

                if (string.IsNullOrEmpty(medicine.ParentID))
                {
                    return;
                }
                var parentExists = await _notificationRepository.CheckParentExistsAsync(medicine.ParentID);
                if (!parentExists) return;

                var notification = new Notify
                {
                    //FormID = "ĐƠN THUỐC",
                    UserID = medicine.ParentID,
                    NotifyName = "Cập nhật thông tin đơn thuốc",
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
    }
}
