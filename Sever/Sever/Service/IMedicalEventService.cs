using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.DTO.MedicalEvent;
using Sever.Model;
using Sever.Repository;
using Sever.Repository.Interfaces;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Sever.Service
{
    public interface IMedicalEventService
    {
        Task<MedicalEventResponse> CreateMedicalEvent(MedicineEventRequest dto);
        Task<MedicalEventResponse> GetMedicalEvent(string MedicalEventID);
        Task UpdateMedicalEventStatus(string MedicalEventID, MedicalEventUpdateDTO dto);
        Task<MedicalEventResponse> UploadMedicalEventImage(string medicalEventId, IFormFile file);
    }
    public class MedicalEventService : IMedicalEventService
    {
        private readonly IMedicalEventRepository _medicalEventRepository;
        private readonly INotificationService _notificationService;
        private readonly IFilesService _filesService; 
        private readonly IHttpContextAccessor _httpContextAccessor;

        public MedicalEventService(
            IMedicalEventRepository medicalEventRepository,
            INotificationService notificationService,
            IFilesService filesService,
            IHttpContextAccessor httpContextAccessor)
        {
            _medicalEventRepository = medicalEventRepository;
            _notificationService = notificationService;
            _filesService = filesService;
            _httpContextAccessor = httpContextAccessor;

        }
        public async Task<MedicalEventResponse> CreateMedicalEvent(MedicineEventRequest dto)
        {
            try
            {
                // Tạo ID tự động theo dạng MVxxx
                string newMedicalEventId = "MV001";
                var latestEvent = await _medicalEventRepository.GetLatestMedicalEventAsync();

                if (latestEvent != null && latestEvent.MedicalEventID.StartsWith("MV"))
                {
                    var numberPart = latestEvent.MedicalEventID.Substring(2);
                    if (int.TryParse(numberPart, out int currentIndex))
                    {
                        newMedicalEventId = $"MV{(currentIndex + 1):D3}";
                    }
                }

                // Get NurseID from access token
                var nurseId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.Name)?.Value
                    ?? throw new Exception("Unable to retrieve nurse ID from access token");

                var medicalEvent = new MedicalEvent
                {
                    MedicalEventID = newMedicalEventId,
                    EventDateTime = DateTime.UtcNow.AddHours(7),
                    Description = dto.Description,
                    ActionTaken = dto.ActionTaken,
                    Notes = dto.Notes,
                    EventTypeID = dto.EventTypeID,
                    NurseID = nurseId,
                };

                await _medicalEventRepository.CreateMedicalEvent(medicalEvent);

                var details = dto.StudentID.Select(studentId => new MedicalEventDetail
                {
                    MedicalEventID = medicalEvent.MedicalEventID,
                    StudentID = studentId
                });

                await _medicalEventRepository.CreateMedicalEventDetails(details);

                // Upload ảnh nếu có
                //if (dto.Image != null)
                //{
                //    var imageResponse = await _filesService.UploadImageAsync(dto.Image);
                //    await _medicalEventRepository.AddMedicalEventImage(medicalEvent.MedicalEventID, imageResponse.Id);
                //}

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
                    EventTypeID = medicalEvent.EventTypeID,
                    NurseID = medicalEvent.NurseID,
                    StudentID = medicalEvent.MedicalEventDetail.Select(d => d.StudentID).ToList(),
                 //   ImageUrl = medicalEvent.Image
                };
            }

            public async Task UpdateMedicalEventStatus(string MedicalEventID, MedicalEventUpdateDTO dto)
            {
                var medicalEvent = await _medicalEventRepository.GetMedicalEventById(MedicalEventID);

                if (medicalEvent == null)
                    throw new Exception("Medical event not found");

                medicalEvent.Notes = $"{medicalEvent.Notes}\nUpdate {DateTime.UtcNow}: {dto.UpdateNotes}";
                medicalEvent.ActionTaken = $"{medicalEvent.ActionTaken}\n{dto.NewActionTaken}";

                await _medicalEventRepository.UpdateMedicalEvent(medicalEvent);
                await _notificationService.MedicalEventNotification(medicalEvent);
            }

            public async Task<MedicalEventResponse> UploadMedicalEventImage(string medicalEventId, IFormFile file)
            {
                var medicalEvent = await _medicalEventRepository.GetMedicalEventById(medicalEventId);

                if (medicalEvent == null)
                    throw new Exception("Medical event not found");

                //var imageResponse = await _filesService.UploadImageAsync(file);
                //await _medicalEventRepository.AddMedicalEventImage(medicalEventId, imageResponse.Id);

                return await GetMedicalEvent(medicalEventId);
            }      
    }
}