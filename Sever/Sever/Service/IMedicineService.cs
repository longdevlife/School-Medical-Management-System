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

/* status cho bên medical để delete
   get thêm file ảnh   done
   đổi list ảnh thành array trong medicine và medical 
   chỗ update ảnh bên medical và medicine thì ko cần xóa ảnh cũ nữa,   done
            chỉ cần thêm ảnh mới vào là được hoặc bỏ lun cái thêm ảnh  done
    
*/
namespace Sever.Service
{
    public interface IMedicineService
    {
        Task<Medicine> CreateMedicineByParentAsync(CreateMedicine dto, string userName);
        Task<Medicine> CreateMedicineByNurseAsync(CreateMedicine dto, string userName);
        Task<bool> UpdateMedicinByParentAsync(MedicineUpdateDTO updateDto, string userName);
        Task<bool> UpdateMedicineByNurseAsync(string medicineId, MedicineStatusUpdate updateDto, string userName);
        Task<bool> AddImageByNurseIDAsync(string medicineId, MedicineStatusUpdate updateDto, string userName);
        Task<bool> AddImageByParentIDAsync(MedicineUpdateDTO updateDto, string userName);

        Task<List<MedicineResponse>> GetMedicinesByStudentAsync(string studentId);
        Task<List<MedicineResponse>> GetMedicineByParentAsync(string userName);
        Task<List<MedicineResponse>> GetAllMedicinesAsync();

        Task<int> TotalMedicinesAsync(DateTime fromDate, DateTime toDate);
    }
        //Parent: create, update, getMedicineByParent, getMedicineByMedicineId, getMedicineByStudentID
        //Nurse: create, update, getMedicineByStatus, getMedicineByStudentID, getMedicineByMedicineId
        public class MedicineService : IMedicineService
        {
            private readonly IMedicineRepository _medicineRepository;
            private readonly IFilesService _filesService;
            private readonly INotificationService _notificationService;
            private readonly IUserService _userService;
            private readonly IStudentProfileRepository _studentProfileRepository;

            public MedicineService(
                IMedicineRepository medicineRepository,
                IFilesService filesService,
                INotificationService notificationService,
                IUserService userService,
                IStudentProfileRepository studentProfileRepository)
            {
                _medicineRepository = medicineRepository;
                _filesService = filesService;
                _notificationService = notificationService;
                _userService = userService;
                _studentProfileRepository = studentProfileRepository;
            }

        public async Task<Medicine> CreateMedicineByParentAsync(CreateMedicine dto, string userName)
        {
            var parent = await _userService.GetUserAsyc(userName);
            var userId = parent.UserID;


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
                    ParentID = userId,
                };

            await _medicineRepository.CreateMedicineAsync(medicine);

            if (dto.Image != null && dto.Image.Length > 0)
            {
                foreach (var item in dto.Image)
                {
                    await _filesService.UploadMedicineImageByAsync(item, medicine.MedicineID);
                }
            }
            await _notificationService.MedicineNotificationForAllNurses(medicine, "Đơn thuốc được tạo bởi phụ huynh. Vui lòng kiểm tra.");
            return medicine;
        }

        public async Task<Medicine> CreateMedicineByNurseAsync(CreateMedicine dto, string userName)
        {
            var nurse = await _userService.GetUserAsyc(userName);
            var userId = nurse.UserID;

            string newId = await _medicineRepository.GetCurrentMedicineID();
            var student = await _studentProfileRepository.GetStudentProfileByStudentId(dto.StudentID);
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
                    NurseID = userId, 
                    ParentID = student.ParentID
                    
                };
                await _medicineRepository.CreateMedicineAsync(medicine);
                if (dto.Image != null && dto.Image.Length > 0)
                {
                    foreach (var item in dto.Image)
                    {
                        await _filesService.UploadMedicineImageByAsync(item, medicine.MedicineID);
                    }
                }
                await _notificationService.MedicineNotificationForParent(medicine, "Đơn thuốc được tạo bởi y tá. Vui lòng kiểm tra.");
                return medicine;
            }

        public async Task<bool> UpdateMedicinByParentAsync(MedicineUpdateDTO updateDto, string userName)
        {

            var parent = await _userService.GetUserAsyc(userName);
            if (parent == null) throw new Exception("Không tìm thấy tài khoản phụ huynh.");
            var userId = parent.UserID;

            var studentList = await _medicineRepository.GetStudentsByParentIdAsync(userId);
            if (studentList == null || !studentList.Any())
                throw new Exception("Phụ huynh không có học sinh nào liên kết.");
            var studentIds = studentList.Select(s => s.StudentID).ToList();

            var allMedicines = new List<Medicine>();

            foreach (var studentId in studentIds)
            {
                var medicines = await _medicineRepository.GetMedicineByStudentIdAsync(studentId);
                allMedicines.AddRange(
                    medicines.Where(m => m.ParentID == userId && m.NurseID == null)
                );
            }

            if (!allMedicines.Any())
                throw new Exception("Không tìm thấy đơn thuốc hợp lệ để chỉnh sửa.");

            var medicine = allMedicines.OrderByDescending(m => m.SentDate).First();

            if (!string.IsNullOrWhiteSpace(updateDto.MedicineName))
                medicine.MedicineName = updateDto.MedicineName;

            if (!string.IsNullOrWhiteSpace(updateDto.Quantity))
                medicine.Quantity = updateDto.Quantity;

            if (!string.IsNullOrWhiteSpace(updateDto.Dosage))
                medicine.Dosage = updateDto.Dosage;

            if (!string.IsNullOrWhiteSpace(updateDto.Instructions))
                medicine.Instructions = updateDto.Instructions;

            if (!string.IsNullOrWhiteSpace(updateDto.Notes))
                medicine.Notes = updateDto.Notes;

            medicine.SentDate = DateTime.UtcNow.AddHours(7);

            if (updateDto.Image != null && updateDto.Image.Length > 0)
            {
                var oldImages = await _filesService.GetImageByMedicineIdAsync(medicine.MedicineID);
                foreach (var img in oldImages)
                {
                    await _filesService.DeleteFileAsync(img.FileLink);
                }

                foreach (var img in updateDto.Image)
                {
                    try
                    {
                        await _filesService.UploadMedicineImageByAsync(img, medicine.MedicineID);
                    }
                    catch
                    {
                        throw new ArgumentException("Lưu ảnh thất bại");
                    }
                }
            }

            await _medicineRepository.UpdateMedicineAsync(medicine);
            await _notificationService.MedicineNotificationForAllNurses(
                medicine,
                $"Phụ huynh '{medicine.ParentID}' đã cập nhật đơn thuốc cho học sinh '{medicine.StudentID}'."
            );

            return true;
        }
        public async Task<bool> AddImageByParentIDAsync(MedicineUpdateDTO updateDto, string userName)
        {

            var parent = await _userService.GetUserAsyc(userName);
            if (parent == null) throw new Exception("Không tìm thấy tài khoản phụ huynh.");
            var userId = parent.UserID;

            var studentList = await _medicineRepository.GetStudentsByParentIdAsync(userId);
            if (studentList == null || !studentList.Any())
                throw new Exception("Phụ huynh không có học sinh nào liên kết.");
            var studentIds = studentList.Select(s => s.StudentID).ToList();

            var allMedicines = new List<Medicine>();

            foreach (var studentId in studentIds)
            {
                var medicines = await _medicineRepository.GetMedicineByStudentIdAsync(studentId);
                allMedicines.AddRange(
                    medicines.Where(m => m.ParentID == userId && m.NurseID == null)
                );
            }

            if (!allMedicines.Any())
                throw new Exception("Không tìm thấy đơn thuốc hợp lệ để chỉnh sửa.");

            var medicine = allMedicines.OrderByDescending(m => m.SentDate).First();

            if (updateDto.Image != null && updateDto.Image.Length > 0)
            {
                foreach (var img in updateDto.Image)
                {
                    try
                    {
                        await _filesService.UploadMedicineImageByAsync(img, medicine.MedicineID);
                    }
                    catch
                    {
                        throw new ArgumentException("Lưu ảnh thất bại");
                    }
                }
            }

            await _medicineRepository.UpdateMedicineAsync(medicine);
            await _notificationService.MedicineNotificationForAllNurses(
                medicine,
                $"Phụ huynh '{medicine.ParentID}' đã cập nhật đơn thuốc cho học sinh '{medicine.StudentID}'."
            );

            return true;
        }
        public async Task<bool> UpdateMedicineByNurseAsync(string medicineId, MedicineStatusUpdate updateDto, string userName)
        {
            var nurse = await _userService.GetUserAsyc(userName);
            var userId = nurse.UserID;

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

            medicine.SentDate = DateTime.UtcNow.AddHours(7);

            if (!string.IsNullOrWhiteSpace(updateDto.Notes))
                medicine.Notes = updateDto.Notes;

            medicine.NurseID = userId;

            var validStatuses = new List<string> { "Chờ xử lý", "Đã xác nhận", "Đang thực hiện", "Đã hoàn thành", "Từ chối" };

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

            if (updateDto.Image != null && updateDto.Image.Length > 0)
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
            await _notificationService.MedicineNotificationForParent(medicine, $"Đơn thuốc đã được cập nhật bởi y tá với trạng thái '{medicine.Status}'.");

            return true;
        }


        public async Task<bool> AddImageByNurseIDAsync(string medicineId, MedicineStatusUpdate updateDto, string userName)
        {
            var nurse = await _userService.GetUserAsyc(userName);
            var userId = nurse.UserID;

            var medicine = await _medicineRepository.GetMedicineByIdAsync(medicineId);
            if (medicine == null)
            {
                throw new Exception("Không tìm thấy đơn thuốc.");
            }

            medicine.NurseID = userId;

            if (updateDto.Image != null && updateDto.Image.Length > 0)
            {

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
            await _medicineRepository.UpdateMedicineAsync(medicine);
            await _notificationService.MedicineNotificationForParent(medicine, $"Đơn thuốc đã được cập nhật bởi y tá với trạng thái '{medicine.Status}'.");

            return true;
        }


        public async Task<List<MedicineResponse>> GetMedicinesByStudentAsync(string studentId)
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
                        ParentID = e.ParentID,
                        StudentID = e.StudentID,
                        Status = e.Status,
                        Class = e.StudentProfile.Class,
                        StudentName = e.StudentProfile.StudentName,

                    });
                }
                return response;
        }


        public async Task<List<MedicineResponse>> GetAllMedicinesAsync()
        {
                var medicines = await _medicineRepository.GetAllMedicinesAsync();
                
                List<MedicineResponse> response = new List<MedicineResponse>();
                foreach (var e in medicines)
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
                        ParentID = e.ParentID,
                        StudentID = e.StudentID,
                        Status = e.Status, 
                        Class = e.StudentProfile.Class,
                        StudentName = e.StudentProfile.StudentName
                    });
                }
                return response;
        }

        public async Task<List<MedicineResponse>> GetMedicineByParentAsync(string userName)
        {
                var parent = await _userService.GetUserAsyc(userName);
                if (parent == null) return null;

                var userId = parent.UserID;

                var studentList = await _medicineRepository.GetStudentsByParentIdAsync(userId);
                if (studentList == null || !studentList.Any()) return null;

                var response = new List<MedicineResponse>();

                foreach (var student in studentList)
                {
                    var medicines = await _medicineRepository.GetMedicineByStudentIdAsync(student.StudentID);
                    foreach (var e in medicines)
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
                            ParentID = e.ParentID,
                            StudentID = e.StudentID,
                            Class = student.Class,
                            StudentName = student.StudentName,
                            Status = e.Status
                        });
                    }
                }
                return response;
        }

        public async Task<int> TotalMedicinesAsync(DateTime fromDate, DateTime toDate)
        {
            return await _medicineRepository.CountMedicinesAsync(fromDate, toDate);
        }
    }
}


