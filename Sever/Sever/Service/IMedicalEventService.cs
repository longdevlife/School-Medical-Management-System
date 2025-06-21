using Sever.DTO.File;
using Sever.DTO.MedicalEvent;
using Sever.DTO.News;
using Sever.Model;
using Sever.Repository.Interfaces;


namespace Sever.Service
{
    public interface IMedicalEventService
    {
        Task<MedicalEventResponse> CreateMedicalEvent(CreateMedicalEvent dto, string userId);
        Task<MedicalEventResponse> GetMedicalEvent(string MedicalEventID);
        Task<bool> UpdateMedicalEvent(MedicalEventUpdateDTO dto);
        Task<List<MedicalEventResponse>> GetMedicalEventsByParent(string studentId);

        public class MedicalEventService : IMedicalEventService
        {
            private readonly IMedicalEventRepository _medicalEventRepository;
            private readonly INotificationService _notificationService;
            private readonly IFilesService _filesService;

            public MedicalEventService(
                IMedicalEventRepository medicalEventRepository,
                INotificationService notificationService,
                IFilesService filesService)
            {
                _medicalEventRepository = medicalEventRepository;
                _notificationService = notificationService;
                _filesService = filesService;
            }
            public async Task<MedicalEventResponse> CreateMedicalEvent(CreateMedicalEvent dto, string userId)
            {
                try
                {
                    string newId = await _medicalEventRepository.GetCurrentMedicialEventID();
                    var medicalEvent = new MedicalEvent
                    {
                        MedicalEventID = newId,
                        EventDateTime = DateTime.UtcNow.AddHours(7),
                        Description = dto.Description,
                        ActionTaken = dto.ActionTaken,
                        Notes = dto.Notes,
                        EventType = dto.EventType,
                        NurseID = userId,
                        ParentID = dto.ParentID,
                    };

                    await _medicalEventRepository.CreateMedicalEvent(medicalEvent);

                    var details = dto.StudentID.Select(studentId => new MedicalEventDetail
                    {
                        MedicalEventID = medicalEvent.MedicalEventID,
                        StudentID = studentId
                    });

                    await _medicalEventRepository.CreateMedicalEventDetails(details);

                    if (dto.Image != null && dto.Image.Any())
                    {
                        foreach (var item in dto.Image)
                        {
                            await _filesService.UploadMedicalEventImageByAsync(item, medicalEvent.MedicalEventID);
                        }
                    }

                    await _notificationService.MedicalEventNotification(medicalEvent);

                    return await GetMedicalEvent(medicalEvent.MedicalEventID);
                }
                catch (Exception ex)
                {
                    throw new Exception("Lỗi khi tạo sự kiện y tế.", ex);
                }
            }

            public async Task<MedicalEventResponse> GetMedicalEvent(string MedicalEventID)
            {
                var medicalEvent = await _medicalEventRepository.GetMedicalEventById(MedicalEventID);

                if (medicalEvent == null)
                    return null;

                return new MedicalEventResponse
                {
                    MedicalEventID = medicalEvent.MedicalEventID,
                    EventDateTime = medicalEvent.EventDateTime,
                    Description = medicalEvent.Description,
                    ActionTaken = medicalEvent.ActionTaken,
                    Notes = medicalEvent.Notes,
                    EventTypeID = medicalEvent.EventType,
                    NurseID = medicalEvent.NurseID,
                    StudentID = medicalEvent.MedicalEventDetail.Select(d => d.StudentID).ToList(),
                };
            }
            public async Task<List<MedicalEventResponse>> GetMedicalEventsByParent(string studentId)
            {
                var medicalEvents = await _medicalEventRepository.GetMedicalEventsByParentIdAsync(studentId);
                List<MedicalEventResponse> response = new List<MedicalEventResponse>();
                foreach (var e in medicalEvents)
                {
                    response.Add(new MedicalEventResponse()
                    {
                        MedicalEventID = e.MedicalEventID,
                        EventDateTime = e.EventDateTime,
                        Description = e.Description,
                        ActionTaken = e.ActionTaken,
                        Notes = e.Notes,
                        EventTypeID = e.EventType,
                        NurseID = e.NurseID,
                        StudentID = e.MedicalEventDetail.Select(d => d.StudentID).ToList(),
                    });
                }
                return response;
            }

            public async Task<bool> UpdateMedicalEvent(MedicalEventUpdateDTO dto)
            {
                var medicalEvents = await _medicalEventRepository.GetMedicalEventById(dto.MedicalEventID);
                if (medicalEvents == null)
                {
                    throw new Exception("không tìm thấy sự kiện y tế.");

                }
                medicalEvents.Notes += $"\nUpdate {DateTime.UtcNow.AddHours(7)}: {dto.Notes}";
                medicalEvents.ActionTaken += $"\n{dto.ActionTaken}";
                medicalEvents.Description = dto.Description;
                medicalEvents.EventType = dto.EventType;
                medicalEvents.ParentID = dto.ParentID;
                bool uploadImg = true;
                var listImage = await _filesService.GetImageByMedicalEventIdAsync(medicalEvents.MedicalEventID);
                foreach (var item in listImage)
                {
                    await _filesService.DeleteFileAsync(item.FileLink);
                }
                foreach (var item in dto.Image)
                {
                    try
                    {
                        await _filesService.UploadMedicalEventImageByAsync(item, medicalEvents.MedicalEventID);
                    }
                    catch
                    {
                        uploadImg = false;
                        throw new ArgumentException("Lưu ảnh thất bại");
                    }
                }
                if (uploadImg || medicalEvents != null)
                {
                    await _notificationService.MedicalEventNotification(medicalEvents);
                    await _medicalEventRepository.UpdateMedicalEvent(medicalEvents);
                    return true;
                }
                return false;
            }
        }
        // nên làm filter hoặc search cho nurse theo medical event
    }
}