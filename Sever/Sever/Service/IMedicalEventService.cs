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
        Task<bool> UpdateMedicalEvent(MedicalEventUpdateDTO dto, string medicalEventId, string userId);
        Task<List<MedicalEventResponse>> GetMedicalEventsByStudentID(string studentId);

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

                    await _notificationService.MedicalEventNotification(medicalEvent, "Sự kiện y tế được tạo bởi y tá. Vui lòng kiểm tra.");

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
            public async Task<List<MedicalEventResponse>> GetMedicalEventsByStudentID(string studentId)
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

            public async Task<bool> UpdateMedicalEvent(MedicalEventUpdateDTO dto, string medicalEventId, string userId)
            {
                var medicalEvents = await _medicalEventRepository.GetMedicalEventById(medicalEventId);
                if (medicalEvents == null)
                {
                    throw new Exception("không tìm thấy sự kiện y tế.");

                }
                medicalEvents.Notes += $"\nUpdate {DateTime.UtcNow.AddHours(7)}: {dto.Notes}";
                if (!string.IsNullOrWhiteSpace(dto.ActionTaken))
                {
                    medicalEvents.ActionTaken += $"\n{dto.ActionTaken}";
                }
                if (!string.IsNullOrWhiteSpace(dto.Description))
                {
                    medicalEvents.Description = dto.Description;
                }

                if (!string.IsNullOrWhiteSpace(dto.EventType))
                {
                    medicalEvents.EventType = dto.EventType;
                }
                await _medicalEventRepository.UpdateMedicalEvent(medicalEvents);


                if (dto.Image != null && dto.Image.Any())
                {
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
                            throw new ArgumentException("Lưu ảnh thất bại");
                        }
                    }
                }
                    await _notificationService.MedicalEventNotification(medicalEvents, $"Sự kiện y tế đã được cập nhật.");
                return true;
            }
        }
    }
}