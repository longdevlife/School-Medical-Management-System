using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using Sever.DTO.File;
using Sever.DTO.MedicalEvent;
using Sever.DTO.Medicine;
using Sever.DTO.SendMedicine;
using Sever.Model;
using Sever.Repository;
using System;
using System.Diagnostics;

namespace Sever.Service
{
    public interface IMedicineService
    {
        Task<Medicine> CreateMedicineByParentAsync(CreateMedicine dto, string userId);
        Task<Medicine> CreateMedicineByNurseAsync(CreateMedicine dto, string userId);
        Task<bool> UpdateMedicinByParentAsync(MedicineUpdateDTO updateDto, string medicineId, string userId);
        Task<bool> UpdateMedicineByNurseAsync(string medicineId, MedicineStatusUpdate updateDto, string userId);
        Task<List<MedicineResponse>> GetMedicinesByStudent(string studentId);
        public class MedicineService : IMedicineService
        {
            private readonly IMedicineRepository _medicineRepository;
            private readonly IFilesService _filesService;
            private readonly INotificationService _notificationService;

            public MedicineService(
                IMedicineRepository medicineRepository,
                IFilesService filesService,
                INotificationService notificationService,
                IHttpContextAccessor httpContextAccessor)
            {
                _medicineRepository = medicineRepository;
                _filesService = filesService;
                _notificationService = notificationService;

            }

            public async Task<Medicine> CreateMedicineByParentAsync(CreateMedicine dto, string userId)
            {
                string newId = await _medicineRepository.GetCurrentMedicineID();

                var medicine = new Medicine
                {
                    MedicineID = newId,
                    MedicineName = dto.MedicineName,
                    Quantity = dto.Quantity,
                    Dosage = dto.Dosage,
                    Instructions = dto.Instructions,
                    SentDate = DateTime.UtcNow.AddHours(7),
                    Notes = dto.Notes,
                    Status = "Chờ xử lý",
                    StudentID = dto.StudentID,
                    ParentID = userId

                };

                await _medicineRepository.CreateMedicineAsync(medicine);

                if (dto.Image != null && dto.Image.Any())
                {
                    foreach (var item in dto.Image)
                    {
                        await _filesService.UploadMedicineImageByAsync(item, medicine.MedicineID);
                    }
                }
                await _notificationService.MedicineNotificationForAllNurses(medicine, "Đơn thuốc được tạo bởi phụ huynh. Vui lòng kiểm tra.");
                return medicine;
            }

            public async Task<Medicine> CreateMedicineByNurseAsync(CreateMedicine dto, string userId)
            {
                string newId = await _medicineRepository.GetCurrentMedicineID();

                var medicine = new Medicine
                {
                    MedicineID = newId,
                    MedicineName = dto.MedicineName,
                    Quantity = dto.Quantity,
                    Dosage = dto.Dosage,
                    Instructions = dto.Instructions,
                    SentDate = DateTime.UtcNow.AddHours(7),
                    Notes = dto.Notes,
                    StudentID = dto.StudentID,
                    Status = (dto.Status == "Chờ xử lý" || dto.Status == "Đã xác nhận" || dto.Status == "Từ chối") ? dto.Status : "Chờ xử lý",
                    NurseID = userId
                };
                await _medicineRepository.CreateMedicineAsync(medicine);
                if (dto.Image != null && dto.Image.Any())
                {
                    foreach (var item in dto.Image)
                    {
                        await _filesService.UploadMedicineImageByAsync(item, medicine.MedicineID);
                    }
                }
                await _notificationService.MedicineNotificationForParent(medicine, "Đơn thuốc được tạo bởi y tá. Vui lòng kiểm tra.");
                return medicine;
            }

            public async Task<bool> UpdateMedicinByParentAsync(MedicineUpdateDTO updateDto, string medicineId, string userId)
            {
                var medicine = await _medicineRepository.GetMedicineByIdAsync(medicineId);
                if (medicine == null)
                {
                    throw new Exception("Không tìm thấy đơn thuốc.");
                }

                if (!string.IsNullOrWhiteSpace(updateDto.MedicineName))
                    medicine.MedicineName = updateDto.MedicineName;

                if (!string.IsNullOrWhiteSpace(updateDto.Quantity))
                    medicine.Quantity = updateDto.Quantity;

                if (!string.IsNullOrWhiteSpace(updateDto.Dosage))
                    medicine.Dosage = updateDto.Dosage;

                if (!string.IsNullOrWhiteSpace(updateDto.Instructions))
                    medicine.Instructions = updateDto.Instructions;

                if (updateDto.SentDate != null)
                    medicine.SentDate = updateDto.SentDate;

                if (!string.IsNullOrWhiteSpace(updateDto.Notes))
                    medicine.Notes = updateDto.Notes;

                medicine.ParentID = userId;

                if (updateDto.Image != null && updateDto.Image.Any())
                {
                    bool uploadImg = true;

                    var listImage = await _filesService.GetImageByMedicineIdAsync(medicine.MedicineID);
                    foreach (var item in listImage)
                    {
                        await _filesService.DeleteFileAsync(item.FileLink);
                    }

                    foreach (var item in updateDto.Image)
                    {
                        try
                        {
                            await _filesService.UploadMedicineImageByAsync(item, medicine.MedicineID);
                        }
                        catch
                        {
                            uploadImg = false;
                            throw new ArgumentException("Lưu ảnh thất bại");
                        }
                    }
                }

                await _medicineRepository.UpdateMedicineAsync(medicine);

                await _notificationService.MedicineNotificationForAllNurses(medicine);

                return true;
            }


            public async Task<bool> UpdateMedicineByNurseAsync(string medicineId, MedicineStatusUpdate updateDto, string userId)
            {
                var medicine = await _medicineRepository.GetMedicineByIdAsync(medicineId);
                if (medicine == null)
                {
                    throw new Exception("Không tìm thấy đơn thuốc.");
                }

                var previousStatus = medicine.Status;

                if (!string.IsNullOrWhiteSpace(updateDto.MedicineName))
                    medicine.MedicineName = updateDto.MedicineName;

                if (!string.IsNullOrWhiteSpace(updateDto.Quantity))
                    medicine.Quantity = updateDto.Quantity;

                if (!string.IsNullOrWhiteSpace(updateDto.Dosage))
                    medicine.Dosage = updateDto.Dosage;

                if (!string.IsNullOrWhiteSpace(updateDto.Instructions))
                    medicine.Instructions = updateDto.Instructions;

                if (updateDto.SentDate != null)
                    medicine.SentDate = updateDto.SentDate;

                if (!string.IsNullOrWhiteSpace(updateDto.Notes))
                    medicine.Notes = updateDto.Notes;

                medicine.NurseID = userId;

                var validStatuses = new List<string> { "Chờ xác nhận", "Đã xác nhận", "Đang thực hiện", "Đã hoàn thành", "Từ chối" };

                if (!string.IsNullOrWhiteSpace(updateDto.Status))
                {
                    if (!validStatuses.Contains(updateDto.Status))
                        throw new Exception("Trạng thái không hợp lệ.");

                    if (updateDto.Status != previousStatus)
                    {
                        medicine.Status = updateDto.Status;
                    }
                }
                else
                {
                    medicine.Status = previousStatus;
                }

                await _medicineRepository.UpdateMedicineAsync(medicine);

                if (updateDto.Image != null && updateDto.Image.Any())
                {
                    var listImage = await _filesService.GetImageByMedicineIdAsync(medicine.MedicineID);
                    foreach (var item in listImage)
                    {
                        await _filesService.DeleteFileAsync(item.FileLink);
                    }

                    foreach (var item in updateDto.Image)
                    {
                        try
                        {
                            await _filesService.UploadMedicineImageByAsync(item, medicine.MedicineID);
                        }
                        catch
                        {
                            throw new ArgumentException("Lưu ảnh thất bại");
                        }
                    }
                }
                await _notificationService.MedicineNotificationForParent(medicine, $"Đơn thuốc đã được cập nhật với trạng thái '{medicine.Status}'.");

                return true;
            }

            public async Task<List<MedicineResponse>> GetMedicinesByStudent(string studentId)
            {
                var medicine = await _medicineRepository.GetMedicineByStudentIdAsync(studentId);
                List<MedicineResponse> response = new List<MedicineResponse>();
                foreach (var e in medicine)
                {
                   response.Add(new MedicineResponse
                    {
                       MedicineID = e.MedicineID,
                       SentDate = e.SentDate,
                       MedicineName = e.MedicineName,
                       Quantity = e.Quantity,
                       Dosage = e.Dosage,
                       Instructions = e.Instructions,
                       Notes = e.Notes,
                       NurseID = e.NurseID,
                       StudentID = e.StudentID,
                       Status = e.Status
                   });
                }
                return response;
            }
        }
    }
}


